import { HTTPMethod } from 'http-method-enum'
import {
  APIListClass,
  APIGetMemberQuestlistResponse
} from 'kcsapi/api_get_member/questlist/response'
import { Quest as WikiQuest } from 'kcwiki-quest-data'

// Poi
export type PoiStore = any
export interface PoiGameResponse<B, P = any> {
  method: HTTPMethod
  path: string
  body: B
  postBody: P
}
export interface PoiQuestlistResponseAction
  extends PoiGameResponse<APIGetMemberQuestlistResponse> {
  type: '@@Response/kcsapi/api_get_member/questlist'
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
export interface WikiQuestStoreLoadAction {
  type: '@@poi-plugin-tabex/wikiQuestMap/load'
  questMap: WikiQuestMap
}

// Tabex
export interface TabexStore {
  apiQuestMap: ApiQuestMap
  wikiQuestMap: WikiQuestMap
}
