import { HTTPMethod } from 'http-method-enum'
import {
  APIListClass
} from 'kcsapi/api_get_member/questlist/response'
import { Quest as WikiQuest } from 'kcwiki-quest-data'
import { SemVer } from 'semver'
import { AnyAction, Action } from 'redux'

// Poi
export type PoiStore = any
export interface PoiGameResponse<B = any, P = any> {
  method: HTTPMethod
  path: string
  body: B
  postBody: P
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

// Tabex
export interface TabexStore {
  apiQuestMap: ApiQuestMap
  wikiQuestMap: WikiQuestMap
  wikiVersion: SemVer | undefined
}
export type TabexOwnProps = any
export interface TabexProps extends TabexStore {
  activeQuestMap: any
}

/**
 * Remove type overlapping in order to benefit from the switch case type guard.
 * Because AnyAction's `type`, which is defined `any`,
 * covers any other action's `type`.
 */
export type AnyActionIncluding<T extends AnyAction> =
  T | Action<Exclude<any, T['type']>>
