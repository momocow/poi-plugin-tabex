import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import _ from 'lodash'
import { AnyAction, combineReducers, Reducer, Unsubscribe } from 'redux'
import { observe, observer } from 'redux-observers'
import { createSelector } from 'reselect'
import { store } from 'views/create-store'
import {
  ApiQuestMap,
  PoiQuestlistResponseAction,
  TabexStore,
  WikiQuest,
  WikiQuestMap,
  WikiQuestStoreLoadAction
} from '../types'
import { readWikiQuest, tabexSeletor } from '../utils'

const DEFAULT_ACTION = { type: undefined }
const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9] // 2=出撃, 8=出撃(2), 9=出撃(3)

const apiQuestsSelector = createSelector(
  tabexSeletor,
  state => state.apiQuestMap
)

const LOAD_WIKI_QUESTS: WikiQuestStoreLoadAction['type'] =
  '@@poi-plugin-tabex/wikiQuestMap/load'
export function loadWikiQuests (
  questMap: WikiQuestMap | WikiQuest[]
): WikiQuestStoreLoadAction {
  return {
    type: LOAD_WIKI_QUESTS,
    questMap: Array.isArray(questMap)
      ? Object.fromEntries(questMap.map(q => [q.game_id, q]))
      : questMap
  }
}

export function connectWikiQuests (): Unsubscribe {
  return observe(store, [
    observer(
      state => apiQuestsSelector(state),
      (dispatch, current) => {
        Promise.all(
          Object.entries(current)
            .filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category))
            .filter(([_, q]) => q.api_state < 3) // 3=達成
            .map(([n]) => Number(n))
            .map(async n => await readWikiQuest(n))
        )
          .then(wikiQuests => {
            _.flow(loadWikiQuests, dispatch)(
              wikiQuests.filter((q): q is WikiQuest => typeof q !== 'undefined')
            )
          })
          .catch(e => {})
      }
    )
  ])
}

export function reducerFactory (
  initApiQuestMap: ApiQuestMap, initWikiQuestMap: WikiQuestMap
): Reducer<TabexStore, AnyAction> {
  const apiQuestStoreReducer: Reducer<ApiQuestMap, AnyAction> =
    (state = initApiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case '@@Response/kcsapi/api_get_member/questlist':
          return Object.fromEntries(
            (action as PoiQuestlistResponseAction).body.api_list
              // filter number-only quests (who are them???)
              .filter((q): q is APIListClass => typeof q !== 'number')
              // make entries with api_no as keys
              .map(q => [
                q.api_no,
                // pick only keys that matter the wiki quest lookup
                _.pick(q, 'api_no', 'api_state', 'api_category')
              ])
          )
        default:
          return state
      }
    }

  const wikiQuestStoreReducer: Reducer<WikiQuestMap, AnyAction> =
    (state = initWikiQuestMap, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case LOAD_WIKI_QUESTS:
          return (action as WikiQuestStoreLoadAction).questMap
        default:
          return state
      }
    }

  return combineReducers({
    apiQuestMap: apiQuestStoreReducer,
    wikiQuestMap: wikiQuestStoreReducer
  })
}
