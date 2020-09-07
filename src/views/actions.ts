import { HTTPMethod } from 'http-method-enum'
import {
  APIGetMemberQuestlistResponse
} from 'kcsapi/api_get_member/questlist/response'
import { SemVer } from 'semver'
import { WikiQuestMap } from '../types'

export interface PoiQuestlistResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  method: HTTPMethod
  path: string
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

export function updateWikiQuestMap (
  wikiQuestMap: WikiQuestMap
): WikiQuestMapUpdateAction {
  return { type: TabexActionType.WikiQuestMapUpdate, wikiQuestMap }
}

export function updateWikiVersion (version: SemVer): WikiVersionUpdateAction {
  return { type: TabexActionType.WikiVersionUpdate, version }
}
