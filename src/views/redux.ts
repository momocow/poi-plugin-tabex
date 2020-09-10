import { Map } from 'immutable'
import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import _ from 'lodash'
import { combineReducers } from 'redux'
import { SemVer } from 'semver'
import { store } from 'views/create-store'
import {
  ApiQuestMap,
  ReducerFactory,
  TabexStore,
  WikiQuestMap
} from '../types'
import {
  PoiQuestlistResponseAction,
  TabexActionType,

  WikiQuestJoinAction,
  WikiVersionSetAction
} from './actions'

export { store }
const DEFAULT_ACTION = { type: undefined }

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
        case TabexActionType.WikiQuestJoin:
          return state.merge((action as WikiQuestJoinAction).map)
        case TabexActionType.WikiQuestReset:
          return Map()
        default:
          return state
      }
    }

export const wikiVersionReducerFactory: ReducerFactory<SemVer, [SemVer]> =
  (defaultVersion) =>
    (state = defaultVersion, action = DEFAULT_ACTION) => {
      switch (action.type) {
        case TabexActionType.WikiVersionSet:
          return (action as WikiVersionSetAction).version
        default:
          return state
      }
    }

export const reducerFactory: ReducerFactory<
TabexStore, [ApiQuestMap, WikiQuestMap, SemVer]> =
  (defaultApiQuestMap, defaultWikiQuestMap, defaultWikiVersion) =>
    combineReducers({
      apiQuestMap: apiQuestMapReducerFactory(defaultApiQuestMap),
      wikiQuestMap: wikiQuestMapReducerFactory(defaultWikiQuestMap),
      wikiVersion: wikiVersionReducerFactory(defaultWikiVersion)
    })
