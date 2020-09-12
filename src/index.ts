import { reducerFactory, store } from './redux'
import { Map } from 'immutable'
import { SemVer } from 'semver'
import { wikiQuestConnect } from './actions'
import { Subscription } from 'rxjs'

export const windowMode = false

export { PoiTabex as reactClass } from './components'

let subsc: Subscription

export async function pluginDidLoad (): Promise<void> {
  if (typeof subsc === 'undefined') {
    subsc = await store.dispatch(wikiQuestConnect(store))
  }
}

export function pluginWillUnload (): void {
  if (typeof subsc !== 'undefined') {
    subsc.unsubscribe()
  }
}

export const reducer = reducerFactory(Map(), Map(), new SemVer('0.0.0'))
