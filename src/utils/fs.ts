import { fork } from 'child-process-promise'
import { readJson } from 'fs-extra'
import path from 'path'
import { parse as parseVersion, SemVer } from 'semver'
import { PackageJson } from 'type-fest'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import { name as PLUGIN_NAME } from '../../package.json'

const { PLUGIN_PATH, ROOT } = window

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
