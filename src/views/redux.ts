import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import _ from 'lodash'
import { AnyAction, combineReducers, Dispatch, Reducer } from 'redux'
import { observe, observer } from 'redux-observers'
import { createSelector } from 'reselect'
import { from, Observable, of } from 'rxjs'
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators'
import { store } from 'views/create-store'
import {
  ApiQuestMap,
  PoiQuestlistResponseAction,
  TabexStore,
  WikiQuest,
  WikiQuestMap,
  WikiQuestMapSyncAction
} from '../types'
import { readWikiQuest, tabexSeletor } from '../utils'

const DEFAULT_ACTION = { type: undefined }
const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9] // 2=出撃, 8=出撃(2), 9=出撃(3)

const apiQuestMapSelector = createSelector(
  tabexSeletor,
  state => state.apiQuestMap
)

const SYNC_WIKI_QUEST_MAP: WikiQuestMapSyncAction['type'] =
  '@@poi-plugin-tabex/wikiQuestMap/sync'
export function loadWikiQuests (
  wikiQuestMap: WikiQuestMap | WikiQuest[]
): WikiQuestMapSyncAction {
  return {
    type: SYNC_WIKI_QUEST_MAP,
    wikiQuestMap: Array.isArray(wikiQuestMap)
      ? Object.fromEntries(wikiQuestMap.map(q => [q.game_id, q]))
      : wikiQuestMap
  }
}

interface ChangeHandle {
  dispatch: Dispatch<AnyAction>
  current: ApiQuestMap
  previous?: ApiQuestMap
}

export const syncWikiQuestMapWithApiQuestMap$ =
  new Observable<ChangeHandle>(
    (subscriber) => observe(store, [
      observer(
        state => apiQuestMapSelector(state),
        (dispatch, current, previous) => {
          subscriber.next({ dispatch, current, previous })
        }
      )
    ])
  )
    .pipe(
      mergeMap(({ dispatch, current }) => of(current).pipe(
        mergeMap(apiQuestMap => from(Object.entries(apiQuestMap)).pipe(
          filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
          filter(([_, q]) => q.api_state < 3), // 3=達成
          map(([n]) => Number(n)),
          mergeMap(n => from(readWikiQuest(n))),
          filter((q): q is WikiQuest => q !== null),
          reduce<WikiQuest, WikiQuestMap>(
            (acc, q) => Object.assign(acc, { [q.game_id]: q }), {}
          ),
          map(wikiQuestMap => ({ wikiQuestMap, apiQuestMap }))
        )),
        map(syncHandle => ({ ...syncHandle, dispatch }))
      )),
      tap(
        ({ dispatch, wikiQuestMap }) => dispatch(loadWikiQuests(wikiQuestMap))
      )
    )

export function reducerFactory (
  initApiQuestMap: ApiQuestMap, initWikiQuestMap: WikiQuestMap
): Reducer<TabexStore, AnyAction> {
  const apiQuestStoreReducer: Reducer<ApiQuestMap, AnyAction> =
    (state = initApiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case '@@Response/kcsapi/api_get_member/questlist': {
          const {
            postBody: { api_tab_id: apiTabId },
            body: { api_list: apiList }
          } = action as PoiQuestlistResponseAction
          const newQuestMap = Object.fromEntries(
            apiList
              // filter number-only quests (who are them???)
              .filter((q): q is APIListClass => typeof q !== 'number')
              // make entries with api_no as keys
              .map(q => [
                q.api_no,
                // pick only keys that matter the wiki quest lookup
                _.pick(q, 'api_no', 'api_state', 'api_category')
              ])
          )
          return apiTabId === 0 // overwrite if tab id is 0, 0=全て
            ? newQuestMap : { ...state, ...newQuestMap }
        }
        default:
          return state
      }
    }

  const wikiQuestStoreReducer: Reducer<WikiQuestMap, AnyAction> =
    (state = initWikiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case SYNC_WIKI_QUEST_MAP:
          return (action as WikiQuestMapSyncAction).wikiQuestMap
        default:
          return state
      }
    }

  return combineReducers({
    apiQuestMap: apiQuestStoreReducer,
    wikiQuestMap: wikiQuestStoreReducer
  })
}
