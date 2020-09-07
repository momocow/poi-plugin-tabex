import { fork as procFork } from 'child_process'
import { readJson, readJsonSync } from 'fs-extra'
import path from 'path'
import { Selector } from 'reselect'
import { parse as parseVersion, SemVer } from 'semver'
import { PackageJson } from 'type-fest'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
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

const { PLUGIN_PATH, ROOT } = window

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

export function readPackageVersionSync (
  name: string
): SemVer | null {
  const targetFilename = `${name}/package.json`
  let packageJson: PackageJson
  try {
    const packageJsonFile = require.resolve(targetFilename)
    packageJson = readJsonSync(packageJsonFile)
  } catch (e) {
    return null
  }
  // trust all npm package versions to be valid
  return parseVersion(packageJson.version)
}

export async function runScriptAsync (
  ...args: Parameters<typeof procFork>
): Promise<void> {
  return await new Promise((resolve) => {
    const proc = procFork(...args)
    proc.on('exit', () => resolve())
  })
}

export const NPM_EXEC_PATH = path.join(
  ROOT, 'node_modules', 'npm', 'bin', 'npm-cli.js'
)

export const PLUGIN_ROOT = path.join(PLUGIN_PATH, 'node_modules', PLUGIN_NAME)

export async function installPackage (
  packageName: string, version: string, npmConfig?: any
): Promise<void> {
  if (packageName.length === 0) {
    return
  }
  if (version.length > 0) {
    packageName = `${packageName}@${version}`
  }
  npmConfig = npmConfig ?? getNpmConfig(PLUGIN_PATH)
  let args = ['install', '--registry', npmConfig.registry]
  if (
    typeof npmConfig.http_proxy === 'string' && npmConfig.http_proxy.length > 0
  ) {
    args = [...args, '--proxy', npmConfig.http_proxy]
  }
  args = [
    ...args,
    '--no-progress',
    '--no-save',
    '--no-package-lock',
    packageName
  ]
  await runScriptAsync(NPM_EXEC_PATH, args, {
    cwd: npmConfig.prefix
  })
}
