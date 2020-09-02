import { AnyAction, combineReducers, Reducer } from 'redux'
import {
  ApiQuestCategory,
  ApiQuestListResponseAction,
  ApiQuestState,
  Quest
} from './types'

type QuestListAction = ApiQuestListResponseAction | AnyAction

const SHUTSUGEKI_QUESTS: readonly ApiQuestCategory[] = [
  ApiQuestCategory.ShuTsuGeKi,
  ApiQuestCategory.ShuTsuGeKi2,
  ApiQuestCategory.ShuTsuGeKi3
]

const questsReducer: Reducer<Quest[], QuestListAction> = (state, action) => {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/questlist':
      return (action as ApiQuestListResponseAction).body.api_list
        .filter(q => SHUTSUGEKI_QUESTS.includes(q.api_category))
        .filter(q => q.api_state < ApiQuestState.Done)
        .map(q => ({
          kcsapi: q,
          kcwiki: 
        }))
    default:
      return state ?? []
  }
}

export const reducer = combineReducers({
  quests: questsReducer
})
