import {
  syncWikiQuestMapWithApiQuestMap$,
  reducerFactory,
  updateWikiPackage,
  store
} from './views/redux'
import { Subscription } from 'rxjs'
import { Map } from 'immutable'
import { SemVer } from 'semver'

export const windowMode = false

export { PoiTabex as reactClass } from './views'

let syncSubscription: Subscription | undefined

export function pluginDidLoad (): void {
  if (typeof syncSubscription !== 'undefined') {
    syncSubscription.unsubscribe()
  }
  syncSubscription = syncWikiQuestMapWithApiQuestMap$.subscribe()
  store.dispatch(updateWikiPackage())
}

export function pluginWillUnload (): void {
  if (typeof syncSubscription !== 'undefined') {
    syncSubscription.unsubscribe()
  }
}

export const reducer = reducerFactory(Map(), Map(), new SemVer('0.0.0'))
