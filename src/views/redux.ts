import AsyncLock from 'async-lock'
import Immutable, { Map } from 'immutable'
import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import fetchRemotePackageJson, { AbbreviatedMetadata } from 'package-json'
import _ from 'lodash'
import { AnyAction, combineReducers } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { forkJoin, from, Observable } from 'rxjs'
import {
  filter,
  map,
  mergeMap,
  reduce,
  skipWhile,
  switchMap,
  tap
} from 'rxjs/operators'
import {
  eq as isEqualVersion,
  SemVer,
  maxSatisfying
} from 'semver'
import { store } from 'views/create-store'
import { getNpmConfig } from 'views/services/plugin-manager/utils'
import {
  ApiQuestMap,
  ReducerFactory,
  TabexStore,
  WikiQuest,
  WikiQuestMap
} from '../types'
import {
  installPackage,
  PLUGIN_ROOT,
  readWikiQuest,
  getLocalWikiVersion
} from '../utils'
import {
  PoiQuestlistResponseAction,
  TabexActionType,
  updateWikiQuestMap,
  updateWikiVersion,
  WikiQuestMapUpdateAction,
  WikiVersionUpdateAction
} from './actions'
import { observeReduxStore$ } from './utils'
import { PackageJson } from 'type-fest'
import {
  wikiVersionSelector,
  wikiQuestMapSelector,
  apiQuestMapSelector,
  tabexConfigSelector
} from '../selectors'
import { KcwikiError } from '../errors'

export { store }
const DEFAULT_ACTION = { type: undefined }
const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9] // 2=出撃, 8=出撃(2), 9=出撃(3)

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

// export const wikiQuestMapReducerFactory:
// ReducerFactory<WikiQuestMap, [WikiQuestMap]> =
//   (defaultWikiQuestMap) =>
//     (state = defaultWikiQuestMap, action = DEFAULT_ACTION) => {
//       switch (action.type) {
//         case TabexActionType.WikiQuestMapUpdate:
//           return state.merge((action as WikiQuestMapUpdateAction).wikiQuestMap)
//         default:
//           return state
//       }
//     }

// export const wikiVersionReducerFactory: ReducerFactory<SemVer, [SemVer]> =
//   (defaultVersion) =>
//     (state = defaultVersion, action = DEFAULT_ACTION) => {
//       switch (action.type) {
//         case TabexActionType.WikiVersionUpdate:
//           return (action as WikiVersionUpdateAction).version
//         default:
//           return state
//       }
//     }

export const reducerFactory: ReducerFactory<TabexStore, [ApiQuestMap]> =
  (defaultApiQuestMap) => combineReducers({
    apiQuestMap: apiQuestMapReducerFactory(defaultApiQuestMap)
  })

export async function validateCachedWikiVersion (): Promise<boolean> {
  const installedVersion = await getLocalWikiVersion()
  const cachedVersion = wikiVersionSelector(store.getState())
  return typeof cachedVersion === 'undefined' || // no cache
    isEqualVersion(installedVersion, cachedVersion)
}

export interface LockHandle {
  release: () => void
}

export function acquireWikiResource$ (
  name: WikiResource
): Observable<LockHandle> {
  return new Observable(observer => {
    const lockPromise = new Promise<void>(
      resolve => observer.next({ release: resolve })
    )
    wikiResourceLock.acquire(name, async () => await lockPromise)
      .then(() => observer.complete())
      .catch(error => observer.error(error))
  })
}

export const resetWikiQuestMapOnWikiVersionChange$ =
  observeReduxStore$(store, wikiVersionSelector, {
    equals: (x, y) => x instanceof SemVer && y instanceof SemVer
      ? isEqualVersion(x, y) : x === y
  })
    .pipe(
      tap(({ dispatch }) => dispatch(updateWikiQuestMap(Map())))
    )

export const processWikiQuestMap$ =
  (apiQuestMap: ApiQuestMap): Observable<WikiQuestMap> => {
    return forkJoin( // forkJoin will wait for completion before piping
      acquireWikiResource$(WikiResource.KcwikiQuestData).pipe(
        // critical section
        mergeMap(lock => from(apiQuestMap.entries()).pipe(
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
          tap(() => lock.release())
        ))
      )
    ).pipe(
      map(([wikiQuestMap]) => wikiQuestMap)
    )
  }

export const syncWikiQuestMapWithApiQuestMap$ =
  observeReduxStore$(store, apiQuestMapSelector, { equals: Immutable.is })
    .pipe(
      skipWhile(() => wikiResourceLock.isBusy()),
      switchMap(({ dispatch, current }) => processWikiQuestMap$(current).pipe(
        tap(wikiQuestMap => dispatch(updateWikiQuestMap(wikiQuestMap)))
      ))
    )
