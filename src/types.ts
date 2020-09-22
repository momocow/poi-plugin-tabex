import { Map } from 'immutable'
import { APIListClass } from 'kcsapi/api_get_member/questlist/response'
import { Quest as WikiQuest } from 'kcwiki-quest-data'
import { AnyAction, Reducer } from 'redux'
import { SemVer } from 'semver'

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

export interface TabexConfig {
  kcwikiVersionRange: string
}

export type ReducerFactory<
  State, P extends any[] = [], A extends AnyAction = AnyAction
> = (...params: P) => Reducer<State, A>

// kcwiki-quest-data
export type Requirements = WikiQuest['requirements']
export type ConjunctionRequirement = Extract<Requirements, {
  category: 'and' | 'or' | 'then'
}>
export type NormalRequirement = Exclude<Requirements, ConjunctionRequirement>
export type SortieRequirement = Extract<NormalRequirement, {
  category: 'sortie'
}>
export type SimpleRequirement = Extract<NormalRequirement, {
  category: 'simple'
}>
export interface SimpleBattleRequirement extends SimpleRequirement {
  subcategory: 'battle'
}
export type GeneralSortieRequirement =
  SortieRequirement |
  SimpleBattleRequirement

/**
 * SR: SortieRequirement
 */
export function isSR (r: Requirements): r is SortieRequirement {
  return r.category === 'sortie'
}

/**
 * SBR: SimpleBattleRequirement
 */
export function isSBR (r: Requirements): r is SimpleBattleRequirement {
  return r.category === 'simple' && r.subcategory === 'battle'
}

export function isGeneralSR (r: Requirements): r is GeneralSortieRequirement {
  return isSR(r) || isSBR(r)
}

export type Result = Exclude<SortieRequirement['result'], undefined>

/**
 * Sortie plans from sortie requirements and simple battle requirements.
 * Each property is defined as a condition.
 * If any property is undefined, it's a wildcard condition.
 */
export interface SortiePlan {
  map: string
  result: Result
}
