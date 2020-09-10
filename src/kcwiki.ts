import { readJson } from 'fs-extra'
import fetchRemotePackageJson, { AbbreviatedMetadata } from 'package-json'
import {
  eq as vEq,
  maxSatisfying as vMaxSatisfying,
  SemVer,
  valid as vValid
} from 'semver'
import { PackageJson } from 'type-fest'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import { KcwikiError } from './errors'
import { WikiQuest } from './types'
import { installPackage, PLUGIN_ROOT, readPackageVersion } from './utils'
import { RLock } from './utils/lock'

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
