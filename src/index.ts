import { syncWikiQuestMapWithApiQuestMap$, reducerFactory } from './views/redux'
import { Subscription } from 'rxjs'

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

export const reducer = reducerFactory({}, {})
