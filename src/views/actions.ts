import { HTTPMethod } from 'http-method-enum'
import {
  APIGetMemberQuestlistResponse
} from 'kcsapi/api_get_member/questlist/response'
import { SemVer } from 'semver'
import { WikiQuestMap, PoiStore } from '../types'
import { ThunkAction } from 'redux-thunk'
import { upgrade as upgradeLocalWiki } from '../kcwiki'
import { wikiVersionSelector } from '../selectors'

export interface PoiQuestlistResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  method: HTTPMethod
  path: string
  body: APIGetMemberQuestlistResponse
  postBody: { api_tab_id: number }
}

export enum TabexActionType {
  WikiQuestJoin = '@@poi-plugin-tabex/WikiQuest/join',
  KcwikiPreUpgrade = '@@poi-plugin-tabex/Kcwiki/upgrade/pre',
  KcwikiPostUpgrade = '@@poi-plugin-tabex/Kcwiki/upgrade/post'
}

export interface WikiQuestJoinAction {
  type: TabexActionType.WikiQuestJoin
  map: WikiQuestMap
}

export interface KcwikiPreUpgradeAction {
  type: TabexActionType.KcwikiPreUpgrade
  range: string
}

export interface KcwikiPostUpgradeAction {
  type: TabexActionType.KcwikiPostUpgrade
  currentVersion: SemVer
  previousVersion: SemVer
}

export function wikiQuestJoin (map: WikiQuestMap): WikiQuestJoinAction {
  return { type: TabexActionType.WikiQuestJoin, map }
}

export function kcwikiPreUpgrade (range: string):
ThunkAction<Promise<void>, PoiStore, {}, KcwikiPostUpgradeAction> {
  return async (dispatch, getState) => {
    const previous = wikiVersionSelector(getState())
    const current = await upgradeLocalWiki(range)
    dispatch(kcwikiPostUpgrade(previous, current))
  }
}

export function kcwikiPostUpgrade (
  previousVersion: SemVer,
  currentVersion: SemVer
): KcwikiPostUpgradeAction {
  return {
    type: TabexActionType.KcwikiPostUpgrade, currentVersion, previousVersion
  }
}
