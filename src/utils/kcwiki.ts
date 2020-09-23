import { readJson } from 'fs-extra'
import { Map } from 'immutable'
import { intersection } from 'lodash'
import fetchRemotePackageJson, { AbbreviatedMetadata } from 'package-json'
import { forkJoin, from, Observable } from 'rxjs'
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators'
import {
  eq as vEq,
  maxSatisfying as vMaxSatisfying,
  SemVer,
  valid as vValid
} from 'semver'
import { PackageJson } from 'type-fest'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import { KcwikiError } from '../errors'
import { wikiQuestMapSelector } from '../selectors'
import {
  ApiQuestMap,
  BattleRank,
  // BattleResult,
  isGeneralSR,
  // isIncomparableResult,
  NormalRequirement,
  Result,
  SortiePlan,
  WikiQuest,
  WikiQuestMap
} from '../types'
import { installPackage, PLUGIN_ROOT, readPackageVersion } from './fs'
import { RLock } from './lock'

export const resourceLock = new RLock()

export enum WikiResource {
  KcwikiQuestDataWrite = 'kcwiki-quest-data:write',
  KcwikiQuestDataRead = 'kcwiki-quest-data:read'
}

export async function getLocalVersion (): Promise<SemVer> {
  const version = await readPackageVersion('kcwiki-quest-data')
  if (version === null) {
    throw new KcwikiError('indeterminate local version')
  }
  return version
}

function isValidVersion<T extends string> (v?: T): v is T {
  return vValid(v) !== null
}

export async function upgrade (versionOrRange: string): Promise<void> {
  return await resourceLock.acquire(
    WikiResource.KcwikiQuestDataWrite,
    async () => {
      const localVersion: SemVer = await getLocalVersion()
      let targetVersion: string

      const npmConfig = getNpmConfig(PLUGIN_ROOT)
      const remotePackage: PackageJson & AbbreviatedMetadata =
        await fetchRemotePackageJson('kcwiki-quest-data', {
          registryUrl: npmConfig.registry
        })
      const remoteVersions = Object.keys(remotePackage.versions)

      if (!isValidVersion(versionOrRange)) { // range
        const satisfiedVersion = vMaxSatisfying(remoteVersions, versionOrRange)
        if (satisfiedVersion === null) { // no update avaiable
          return
        }
        targetVersion = satisfiedVersion
      } else {
        const validVersion = vValid(versionOrRange) as string
        const matchedVersion = remoteVersions.find(v => vEq(v, validVersion))
        if (typeof matchedVersion === 'undefined') { // no update avaiable
          return
        }
        targetVersion = matchedVersion
      }
      if (!vEq(targetVersion, localVersion)) {
        await installPackage('kcwiki-quest-data', targetVersion, npmConfig)
      }
    }
  )
}

export async function loadQuest (gameId: number): Promise<WikiQuest | null> {
  const targetFilename = `kcwiki-quest-data/data/${gameId}.json`
  try {
    const questJsonFile = require.resolve(targetFilename)
    return await readJson(questJsonFile)
  } catch (e) {
    return null
  }
}

/**
 * 2=出撃, 8=出撃(2), 9=出撃(3)
 */
export const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9]

export interface LockHandle {
  release: () => void
}

export function acquireWikiResource$ (
  name: WikiResource
): Observable<LockHandle> {
  return new Observable(observer => {
    const lockPromise = new Promise<void>(
      resolve => observer.next({ release: resolve })
    )
    resourceLock.acquire(name, async () => await lockPromise)
      .then(() => observer.complete())
      .catch(error => observer.error(error))
  })
}

export const processWikiQuestMap$ =
  (state: any, apiQuestMap: ApiQuestMap): Observable<WikiQuestMap> => {
    return forkJoin([ // forkJoin will wait for completion before piping
      acquireWikiResource$(WikiResource.KcwikiQuestDataRead).pipe(
        // critical section
        mergeMap(lock => from(apiQuestMap.entries()).pipe(
          filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
          filter(([_, q]) => q.api_state < 3), // 3=達成
          map(([n]) => n),
          filter(n => !wikiQuestMapSelector(state).has(n)),
          map(n => Number(n)),
          mergeMap(n => from(loadQuest(n))),
          filter((q): q is WikiQuest => q !== null),
          reduce<WikiQuest, WikiQuestMap>(
            (map, q) => map.set(q.game_id, q), Map()
          ),
          tap(() => { lock.release() })
        ))
      )
    ]).pipe(
      map(([WikiQuestMap]) => WikiQuestMap)
    )
  }

export function getNormalRequirements (quest: WikiQuest): NormalRequirement[] {
  switch (quest.requirements.category) {
    case 'and':
    case 'or':
    case 'then':
      return quest.requirements.list
    default:
      return [quest.requirements]
  }
}

export function getRankName (rank: BattleRank): Result {
  const rankEntry = Object.entries(BattleRank)
    .find(([name, value]) => value === rank && !name.startsWith('$'))
  if (typeof rankEntry === 'undefined') {
    throw new TypeError('rank is not one of BattleRanks')
  }
  return rankEntry[0] as Result
}

/**
 * Get all possible sortie plans that fulfills the quest
 */
export function getSortiePlans (quest: WikiQuest): SortiePlan[] {
  return getNormalRequirements(quest)
    .filter(isGeneralSR)
    .map((r): SortiePlan => {
      const maps = r.category === 'simple' ? undefined
        : Array.isArray(r.map) ? r.map
          : typeof r.map !== 'undefined' ? [r.map]
            : undefined
      const result = r.category === 'sortie'
        ? r.result ?? getRankName(BattleRank.$Wildcard)
        : getRankName(BattleRank.$Wildcard)
      return { maps, result }
    })
}

export function getCommonSortiePlan (
  plan1: SortiePlan, plan2: SortiePlan
): SortiePlan | null {
  const maps = typeof plan1.maps === 'undefined' ? plan2.maps
    : typeof plan2.maps === 'undefined' ? plan1.maps
      : intersection(plan1.maps, plan2.maps)
  const result = getRankName(
    Math.max(BattleRank[plan1.result], BattleRank[plan2.result])
  )
  // if no common maps, no common sortie plan
  return maps?.length === 0 ? null : { maps, result }
}

export function getCommonSortiePlans (
  planlist1: SortiePlan[], planlist2: SortiePlan[]
): SortiePlan[] {
  return planlist1
    .flatMap(
      plan1 => planlist2.map(plan2 => getCommonSortiePlan(plan1, plan2))
    )
    .filter((plan): plan is SortiePlan => plan !== null)
}
