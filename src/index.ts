import { syncWikiQuestMapWithApiQuestMap$, reducerFactory } from './views/redux'
import { Subscription } from 'rxjs'
import { readPackageVersionSync } from './utils'
import { Map } from 'immutable'

export const windowMode = false

export { PoiTabex as reactClass } from './views'

let syncSubscription: Subscription | undefined

export function pluginDidLoad (): void {
  if (typeof syncSubscription !== 'undefined') {
    syncSubscription.unsubscribe()
  }
  syncSubscription = syncWikiQuestMapWithApiQuestMap$.subscribe()
}

export function pluginWillUnload (): void {
  if (typeof syncSubscription !== 'undefined') {
    syncSubscription.unsubscribe()
  }
}

const wikiVersion = readPackageVersionSync('kcwiki-quest-data')
if (wikiVersion === null) {
  throw new Error('invalid version of "kcwiki-quest-data"')
}

export const reducer = reducerFactory(Map(), Map(), wikiVersion)
