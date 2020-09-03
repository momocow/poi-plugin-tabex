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
): Promise<WikiQuest | undefined> {
  try {
    const questJson = require.resolve(`kcwiki-quest-data/data/${apiNo}.json`)
    return await readJson(questJson) as WikiQuest
  } catch (e) { }
}
