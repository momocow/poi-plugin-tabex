import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import _ from 'lodash'
import { AnyAction, combineReducers, Dispatch } from 'redux'
import { observe, observer } from 'redux-observers'
import { createSelector } from 'reselect'
import { from, Observable, of } from 'rxjs'
import { filter, map, mergeMap, reduce, tap, switchMap } from 'rxjs/operators'
import { store } from 'views/create-store'
import {
  PoiQuestlistResponseAction,
  WikiQuestMapUpdateAction,
  WikiVersionUpdateAction,
  updateWikiQuestMap,
  TabexActionType,
  updateWikiVersion
} from './actions'
import {
  ApiQuestMap,
  TabexStore,
  WikiQuest,
  WikiQuestMap,
  ReducerFactory,
  WikiVersion
} from '../types'
import { readWikiQuest, tabexSeletor, readPackageVersion } from '../utils'
import Immutable, { Map } from 'immutable'
import { eq as isEqualVersion, SemVer } from 'semver'
import { observeReduxStore$ } from './utils'
import AsyncLock from 'async-lock'

const DEFAULT_ACTION = { type: undefined }
const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9] // 2=出撃, 8=出撃(2), 9=出撃(3)

export const apiQuestMapSelector = createSelector(
  tabexSeletor,
  state => state.apiQuestMap
)
export const wikiQuestMapSelector = createSelector(
  tabexSeletor,
  state => state.wikiQuestMap
)
export const wikiVersionSelector = createSelector(
  tabexSeletor,
  state => state.wikiVersion
)

export const apiQuestMapReducerFactory:
ReducerFactory<ApiQuestMap, [ApiQuestMap]> =
  (defaultApiQuestMap) =>
    (state = defaultApiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case '@@Response/kcsapi/api_get_member/questlist': {
          const {
            postBody: { api_tab_id: apiTabId },
            body: { api_list: apiList }
          } = action as PoiQuestlistResponseAction
          // overwrite if tab id is 0, 0=全て
          return (apiTabId === 0 ? state.clear() : state)
            .merge(
              apiList
                // exclude number-only quests (who are them???)
                .filter((q): q is APIListClass => typeof q !== 'number')
                // make entries with api_no as keys
                .map(q => [
                  q.api_no,
                  // pick only keys that matter the wiki quest lookup
                  _.pick(q, 'api_no', 'api_state', 'api_category')
                ])
            )
        }
        default:
          return state
      }
    }

export const wikiQuestMapReducerFactory:
ReducerFactory<WikiQuestMap, [WikiQuestMap]> =
  (defaultWikiQuestMap) =>
    (state = defaultWikiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case TabexActionType.WikiQuestMapUpdate:
          return state.merge((action as WikiQuestMapUpdateAction).wikiQuestMap)
        default:
          return state
      }
    }

export const wikiVersionReducerFactory:
ReducerFactory<WikiVersion, [WikiVersion]> =
  (defaultVersion) =>
    (state = defaultVersion, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case TabexActionType.WikiVersionUpdate:
          return (action as WikiVersionUpdateAction).version
        default:
          return state
      }
    }

export const reducerFactory:
ReducerFactory<TabexStore, [ApiQuestMap, WikiQuestMap, WikiVersion]> =
  (defaultApiQuestMap, defaultWikiQuestMap, defaultVersion) => combineReducers({
    apiQuestMap: apiQuestMapReducerFactory(defaultApiQuestMap),
    wikiQuestMap: wikiQuestMapReducerFactory(defaultWikiQuestMap),
    wikiVersion: wikiVersionReducerFactory(defaultVersion)
  })

export async function validateCachedWikiVersion (): Promise<boolean> {
  const installedVersion = await readPackageVersion('kcwiki-quest-data')
  if (installedVersion === null) {
    throw new Error('the version of "kcwiki-quest-data" is indeterminate')
  }
  const cachedVersion = wikiVersionSelector(store.getState())
  return typeof cachedVersion === 'undefined' || // no cache
    isEqualVersion(installedVersion, cachedVersion)
}

export const wikiQuestMapLock = new AsyncLock()

export const resetWikiQuestMapOnWikiVersionChange$ =
  observeReduxStore$(store, wikiVersionSelector, {
    equals: (x, y) => x instanceof SemVer && y instanceof SemVer
      ? isEqualVersion(x, y) : x === y
  })
    .pipe(
      switchMap(handle => of(handle).pipe(
        tap(({ dispatch }) => {
          dispatch(updateWikiQuestMap(Map()))
        })
      ))
    )

export const syncWikiQuestMapWithApiQuestMap$ =
  observeReduxStore$(store, apiQuestMapSelector, { equals: Immutable.is })
    .pipe(
      switchMap(({ dispatch, current }) => from(current.entries()).pipe(
        filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
        filter(([_, q]) => q.api_state < 3), // 3=達成
        map(([n]) => n),
        filter(n => !wikiQuestMapSelector(store.getState()).has(n)),
        map(n => Number(n)),
        mergeMap(n => from(readWikiQuest(n))),
        filter((q): q is WikiQuest => q !== null),
        reduce<WikiQuest, WikiQuestMap>(
          (map, q) => map.set(q.game_id, q), Map()
        ),
        // combine closure { apiQuestMap }
        map(wikiQuestMap => ({ wikiQuestMap, apiQuestMap: current }))
      )),
      switchMap(handle => of(handle).pipe(
        // make closure { dispatch, current }
        switchMap(({ dispatch, current }) => of(current).pipe(
          // make closure { apiQuestMap }
          switchMap(apiQuestMap => from(apiQuestMap.entries()).pipe(
            filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
            filter(([_, q]) => q.api_state < 3), // 3=達成
            map(([n]) => n),
            filter(n => !wikiQuestMapSelector(store.getState()).has(n)),
            map(n => Number(n)),
            mergeMap(n => from(readWikiQuest(n))),
            filter((q): q is WikiQuest => q !== null),
            reduce<WikiQuest, WikiQuestMap>(
              (map, q) => map.set(q.game_id, q), Map()
            ),
            // combine closure { apiQuestMap }
            map(wikiQuestMap => ({ wikiQuestMap, apiQuestMap }))
          )),
          switchMap()

        )),
        // switchMap(),
        tap(({ dispatch, wikiQuestMap }) => {
          const wikiVersion = wikiVersionSelector(store.getState())
          if (typeof wikiVersion === 'undefined') {
            
            dispatch(updateWikiVersion())
          }
          dispatch(updateWikiQuestMap(wikiQuestMap))
        })
      ))
    )
