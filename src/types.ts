import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import { Quest as WikiQuest } from 'kcwiki-quest-data'
import { AnyAction, Reducer } from 'redux'
import { SemVer } from 'semver'
import { Map } from 'immutable'

// Poi
export type PoiStore = any

// Kcsapi
export type ApiQuest = APIListClass
export type ApiNecessaryKey = 'api_no' | 'api_state' | 'api_category'
export type ApiPartialQuest
  = Partial<ApiQuest>
  & Pick<ApiQuest, ApiNecessaryKey>
export type ApiQuestMap = Map<ApiPartialQuest['api_no'], ApiPartialQuest>

// Kcwiki
export { WikiQuest }
export type WikiQuestMap = Map<WikiQuest['game_id'], WikiQuest>

// Tabex
export interface TabexStore {
  apiQuestMap: ApiQuestMap
  wikiQuestMap: WikiQuestMap
  wikiVersion: SemVer
}
export type TabexOwnProps = any
export interface TabexProps extends TabexStore {
  activeQuestMap: any
}

export type ReducerFactory<
  State, P extends any[] = [], A extends AnyAction = AnyAction
> = (...params: P) => Reducer<State, A>
