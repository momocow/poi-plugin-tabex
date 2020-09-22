import { Dispatch } from 'react'
import { AnyAction } from 'redux'
import {
  observe,
  observer,
  Options as ReduxObserversOptions
} from 'redux-observers'
import { Selector } from 'reselect'
import { Observable } from 'rxjs'
import { name as PLUGIN_NAME } from '../../package.json'
import { ApiQuestMap, WikiQuestMap } from '../types'

const { config } = global

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

export interface ChangeHandle<T> {
  dispatch: Dispatch<AnyAction>
  current: T
  previous?: T
}

export function observeReduxStore$<S extends Selector<any, any>> (
  store: any, selector: S, options?: ReduxObserversOptions
): Observable<ChangeHandle<ReturnType<S>>> {
  return new Observable(
    (subscriber) => observe(store, [
      observer(
        state => selector(state),
        (dispatch, current, previous) => {
          subscriber.next({ dispatch, current, previous })
        },
        options
      )
    ])
  )
}
