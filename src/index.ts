import { readFromStorage } from './utils'
import { connectWikiQuests, reducerFactory } from './views/redux'

export const windowMode = false

export { PoiTabex as reactClass } from './views'

let disconnectWikiQuests: ReturnType<typeof connectWikiQuests> | undefined

export function pluginDidLoad (): void {
  disconnectWikiQuests = connectWikiQuests()
}

export function pluginWillUnload (): void {
  if (typeof disconnectWikiQuests === 'function') {
    disconnectWikiQuests()
  }
}

export const reducer = reducerFactory(
  readFromStorage('apiQuestMap') ?? {},
  readFromStorage('wikiQuestMap') ?? {}
)
