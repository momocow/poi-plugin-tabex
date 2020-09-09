import { fork } from 'child-process-promise'
import { readJson } from 'fs-extra'
import path from 'path'
import { parse as parseVersion, SemVer } from 'semver'
import { PackageJson } from 'type-fest'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import { name as PLUGIN_NAME, version as PLUGIN_VERSION } from '../package.json'
import { ApiQuestMap, WikiQuestMap } from './types'

const { PLUGIN_PATH, ROOT } = window
const { config } = global

export { PLUGIN_NAME, PLUGIN_VERSION }

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
  await fork(NPM_EXEC_PATH, args, {
    cwd: npmConfig.prefix
  })
}

export const CONFIG_PREFIX = 'plugin.Tabex'

export function getConfigName (key: string): string {
  return `${CONFIG_PREFIX}.${key}`
}

export function getConfig<T = any> (key: string, defaultValue: T): T {
  return config.get<T>(getConfigName(key), defaultValue)
}

export function setConfig (key: string, value: any): void {
  config.set(getConfigName(key), value)
}
