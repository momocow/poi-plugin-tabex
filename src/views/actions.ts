import {
  APIGetMemberQuestlistResponse
} from 'kcsapi/api_get_member/questlist/response'
import { WikiQuestMap, AnyActionIncluding } from '../types'
import { SemVer } from 'semver'
import { Action, AnyAction } from 'redux'

export interface PoiQuestlistResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  body: APIGetMemberQuestlistResponse
  postBody: { api_tab_id: number }
}

export enum TabexActionType {
  WikiQuestMapUpdate = '@@poi-plugin-tabex/WikiQuestMap/update',
  WikiVersionUpdate = '@@poi-plugin-tabex/WikiVersion/update'
}

export interface WikiQuestMapUpdateAction {
  type: TabexActionType.WikiQuestMapUpdate
  wikiQuestMap: WikiQuestMap
}

export interface WikiVersionUpdateAction {
  type: TabexActionType.WikiVersionUpdate
  version: SemVer
}

export type TabexReducerAction = AnyActionIncluding<
WikiQuestMapUpdateAction |
WikiVersionUpdateAction
>

export function updateWikiQuestMap (
  wikiQuestMap: WikiQuestMap
): WikiQuestMapUpdateAction {
  return { type: TabexActionType.WikiQuestMapUpdate, wikiQuestMap }
}

export function updateWikiVersion (version: SemVer): WikiVersionUpdateAction {
  return { type: TabexActionType.WikiVersionUpdate, version }
}
