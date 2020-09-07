// @see https://github.com/poooi/plugin-ship-info/blob/cb251d3858ee793e39bffd2f336b94762e62b87c/shims/globals.d.ts

interface IConfig {
  get: <T = any>(path: string, defaultValue: T) => T
  set: (path: string, value?: any) => void
}

declare namespace NodeJS {
  interface Global {
    config: IConfig
  }
}


interface Window {
  ROOT: string
  APPDATA_PATH: string
  PLUGIN_PATH: string
  config: IConfig
  language: string
  getStore: (path?: string) => any
  isMain: boolean
}
