import { SemVer, eq as vEq } from 'semver'
import { Map } from 'immutable'
import { WikiQuestMap, WikiQuest } from './types'
import { readPackageVersion } from './utils'
import { KcwikiError } from './errors'
import { readJson } from 'fs-extra'

export async function getLocalWikiVersion (): Promise<SemVer> {
  const version = await readPackageVersion('kcwiki-quest-data')
  if (version === null) {
    throw new KcwikiError('indeterminate local version')
  }
  return version
}

// export enum WikiResource {
//   KcwikiQuestData = 'kcwiki-quest-data'
// }

// export const wikiResourceLock = new AsyncLock()

class KcwikiCache {
  private readonly _map: WikiQuestMap = Map()

  constructor (
    public readonly version: SemVer
  ) { }

  get (gameId: number): WikiQuest | null {
    return this._map.get(gameId, null)
  }

  has (gameId: number): boolean {
    return this._map.has(gameId)
  }
}

let instance: KcwikiCache | undefined
export async function getWikiCache (): Promise<KcwikiCache> {
  if (typeof instance === 'undefined' || !vEq(instance.version, version)) {
    const version = await getLocalWikiVersion()
    instance = new KcwikiCache(version)
  }
  return instance
}

export async function loadWikiQuest (gameId: number): Promise<void> {
  const cache = await getWikiCache()
  const version = await getLocalWikiVersion()
  if (!vEq(cache.version, version)) {
    instance = new KcwikiCache(version)
  }
  const targetFilename = `kcwiki-quest-data/data/${gameId}.json`
  let quest: WikiQuest
  try {
    const questJsonFile = require.resolve(targetFilename)
    quest = await readJson(questJsonFile)
    this._map = this._map.set(quest.game_id, quest)
  } catch (e) {
    this.onLoadError?.(e)
  }
}

export function updateLocalWiki (): Promise<SemVer> {
  return async function (dispatch) {
    const npmConfig = getNpmConfig(PLUGIN_ROOT)
    const remotePackage: PackageJson & AbbreviatedMetadata =
      await fetchRemotePackageJson('kcwiki-quest-data', {
        registryUrl: npmConfig.registry
      })
    const remoteVersions = Object.keys(remotePackage.versions)
    const { kcwikiVersionRange } = tabexConfigSelector(store)
    const targetVersion = maxSatisfying(remoteVersions, kcwikiVersionRange)

    let localVersion: SemVer | undefined
    let newVersion: SemVer | undefined
    await wikiResourceLock.acquire(WikiResource.KcwikiQuestData, async () => {
      localVersion = await getLocalWikiVersion()
      if (
        targetVersion !== null && !isEqualVersion(targetVersion, localVersion)
      ) {
        await installPackage('kcwiki-quest-data', targetVersion, npmConfig)
        newVersion = await getLocalWikiVersion() // @TODO roll back on error?
        dispatch(updateWikiVersion(newVersion))
      }
    })
    if (typeof newVersion === 'undefined') {
      throw new KcwikiError('')
    }
    return newVersion
  }
}
