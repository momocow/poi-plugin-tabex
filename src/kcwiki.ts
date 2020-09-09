import {
  SemVer,
  eq as vEq,
  maxSatisfying as vMaxSatisfying,
  valid as vValid
} from 'semver'
import { readPackageVersion, PLUGIN_ROOT, installPackage } from './utils'
import { KcwikiError } from './errors'
import AsyncLock from 'async-lock'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import { PackageJson } from 'type-fest'
import fetchRemotePackageJson, { AbbreviatedMetadata } from 'package-json'
import { WikiQuest } from './types'
import { readJson } from 'fs-extra'

// export const 
export const resourceLock = new AsyncLock()

export enum WikiResource {
  KcwikiQuestData = 'kcwiki-quest-data'
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

export async function upgrade (versionOrRange: string): Promise<SemVer> {
  return await resourceLock.acquire(WikiResource.KcwikiQuestData, async () => {
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
        return localVersion
      }
      targetVersion = satisfiedVersion
    } else {
      const validVersion = vValid(versionOrRange) as string
      const matchedVersion = remoteVersions.find(v => vEq(v, validVersion))
      if (typeof matchedVersion === 'undefined') { // no update avaiable
        return localVersion
      }
      targetVersion = matchedVersion
    }
    if (!vEq(targetVersion, localVersion)) {
      await installPackage('kcwiki-quest-data', targetVersion, npmConfig)
      return await getLocalVersion()
    }
    return localVersion
  })
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
