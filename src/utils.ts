import { readJson } from 'fs-extra'
import { Selector } from 'reselect'
import { extensionSelectorFactory } from 'views/utils/selectors'
import {
  name as PLUGIN_NAME,
  version as PLUGIN_VERSION
} from '../package.json'
import {
  ApiQuestMap,
  PoiStore,
  TabexStore,
  WikiQuest,
  WikiQuestMap
} from './types'
import { SemVer, parse as parseVersion } from 'semver'
import { PackageJson } from 'type-fest'

export { PLUGIN_NAME, PLUGIN_VERSION }

export const tabexSeletor: Selector<PoiStore, TabexStore> =
  extensionSelectorFactory(PLUGIN_NAME)

interface StorageType {
  apiQuestMap: ApiQuestMap
  wikiQuestMap: WikiQuestMap
}

export function getStorageKey (
  dataType: keyof StorageType
): string {
  return `${PLUGIN_NAME}/${dataType}`
}

export function readFromStorage<T extends keyof StorageType> (
  dataType: T
): StorageType[T] | null {
  const cache = localStorage.getItem(getStorageKey(dataType))
  return cache === null ? null : JSON.parse(cache)
}

export async function readWikiQuest (
  apiNo: number
): Promise<WikiQuest | null> {
  const targetFilename = `kcwiki-quest-data/data/${apiNo}.json`
  try {
    const questJsonFile = require.resolve(targetFilename)
    return await readJson(questJsonFile) as WikiQuest
  } catch (e) {
    return null
  }
}

export async function readPackageVersion (
  name: string
): Promise<SemVer | null> {
  const targetFilename = `${name}/package.json`
  let packageJson: PackageJson
  try {
    const packageJsonFile = require.resolve(targetFilename)
    packageJson = await readJson(packageJsonFile)
  } catch (e) {
    return null
  }
  // trust all npm package versions to be valid
  return parseVersion(packageJson.version)
}
