import { HTTPMethod } from 'http-method-enum'
import {
  APIGetMemberQuestlistResponse,
  APIListClass
} from 'kcsapi/api_get_member/questlist/response'
import { Quest as WikiQuest } from 'kcwiki-quest-data'

// Poi
export type PoiStore = any
export interface PoiGameResponse<B = any, P = any> {
  method: HTTPMethod
  path: string
  body: B
  postBody: P
}
export interface PoiQuestlistResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  body: APIGetMemberQuestlistResponse
  postBody: { api_tab_id: number }
}

// Kcsapi
export type ApiQuest = APIListClass
export type ApiNecessaryKey = 'api_no' | 'api_state' | 'api_category'
export type ApiPartialQuest
  = Partial<ApiQuest>
  & Pick<ApiQuest, ApiNecessaryKey>
export type ApiQuestMap = Record<ApiPartialQuest['api_no'], ApiPartialQuest>

// Kcwiki
export { WikiQuest }
export type WikiQuestMap = Record<WikiQuest['game_id'], WikiQuest>
export interface WikiQuestMapSyncAction {
  type: '@@poi-plugin-tabex/wikiQuestMap/sync'
  wikiQuestMap: WikiQuestMap
}

// Tabex
export interface TabexStore {
  apiQuestMap: ApiQuestMap
  wikiQuestMap: WikiQuestMap
}
export type TabexOwnProps = any
export interface TabexProps extends TabexStore {
  activeQuestMap: any
}
