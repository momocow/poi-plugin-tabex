import { HTTPMethod } from 'http-method-enum'
import { Action } from 'redux'
import { ApiQuest, ApiQuestList } from './kcsapi'
import { Quest as WikiQuest } from 'kcwiki-quest-data'

export * from './kcsapi'

export interface PoiInfoQuests {
  records: any[]
  activeQuests: any[]
}

export interface PoiReduxStore {
  info: { quests: PoiInfoQuests }
}

export interface ResponseAction extends Action<string> {
  method: HTTPMethod
  path: string
  body: any
  postBody: any
}

export interface ApiQuestListResponseAction extends ResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  method: HTTPMethod.POST
  body: ApiQuestList
}

export interface TabexProps {
  poiQuests: PoiInfoQuests
}

export interface Quest {
  kcsapi: ApiQuest
  kcwiki: WikiQuest
}
