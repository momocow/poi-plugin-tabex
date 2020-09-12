import { HTTPMethod } from 'http-method-enum'
import Immutable from 'immutable'
import {
  APIGetMemberQuestlistResponse
} from 'kcsapi/api_get_member/questlist/response'
import { ThunkAction } from 'redux-thunk'
import { skipWhile, switchMap } from 'rxjs/operators'
import { eq as vEq, SemVer, validRange } from 'semver'
import {
  getLocalVersion, resourceLock, upgrade as upgradeLocalWiki,
  WikiResource
} from './kcwiki'
import { apiQuestMapSelector, wikiVersionSelector } from './selectors'
import { PoiStore, WikiQuestMap } from './types'
import { observeReduxStore$ } from './utils'
import { processWikiQuestMap$ } from './utils/wiki'
import { Subscription } from 'rxjs'

export interface PoiQuestlistResponseAction {
  type: '@@Response/kcsapi/api_get_member/questlist'
  method: HTTPMethod
  path: string
  body: APIGetMemberQuestlistResponse
  postBody: { api_tab_id: number }
}

export enum TabexActionType {
  WikiQuestJoin = '@@poi-plugin-tabex/WikiQuest/join',
  WikiQuestReset = '@@poi-plugin-tabex/WikiQuest/reset',
  WikiVersionSet = '@@poi-plugin-tabex/WikiVersion/set',
  KcwikiPreUpgrade = '@@poi-plugin-tabex/Kcwiki/upgrade/pre',
  KcwikiPostUpgrade = '@@poi-plugin-tabex/Kcwiki/upgrade/post',
}

export interface WikiQuestJoinAction {
  type: TabexActionType.WikiQuestJoin
  map: WikiQuestMap
}

export interface WikiQuestResetAction {
  type: TabexActionType.WikiQuestReset
}

export interface WikiVersionSetAction {
  type: TabexActionType.WikiVersionSet
  version: SemVer
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

export type WikiAction =
  KcwikiPreUpgradeAction |
  KcwikiPostUpgradeAction |
  WikiQuestJoinAction |
  WikiQuestResetAction |
  WikiVersionSetAction

export type WikiThunkAction<T> =
  ThunkAction<T, PoiStore, {}, WikiAction>

export function wikiQuestJoin (map: WikiQuestMap): WikiQuestJoinAction {
  return { type: TabexActionType.WikiQuestJoin, map }
}

export function wikiQuestReset (): WikiQuestResetAction {
  return { type: TabexActionType.WikiQuestReset }
}

export function wikiVersionSet (version: SemVer): WikiVersionSetAction {
  return { type: TabexActionType.WikiVersionSet, version }
}

export function wikiQuestConnect (store: any):
WikiThunkAction<Promise<Subscription>> {
  return async (dispatch) => {
    await dispatch(wikiVersionValidate())
    return observeReduxStore$(store, apiQuestMapSelector, {
      equals: Immutable.is
    }).pipe(
      skipWhile(() => resourceLock.owner === WikiResource.KcwikiQuestDataWrite),
      switchMap(
        ({ current }) => processWikiQuestMap$(store.getState(), current)
      )
    ).subscribe(wikiQuestMap => { dispatch(wikiQuestJoin(wikiQuestMap)) })
  }
}

export function wikiQuestMapRefresh (): WikiThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch(wikiQuestReset())

    const state = getState()
    const apiQuestMap = apiQuestMapSelector(state)
    const wikiQuestMap = await processWikiQuestMap$(
      state, apiQuestMap
    ).toPromise()
    dispatch(wikiQuestJoin(wikiQuestMap))
  }
}

export function wikiVersionValidate (): WikiThunkAction<Promise<SemVer>> {
  return async (dispatch, getState) => {
    const installedVersion = await getLocalVersion()
    const state = getState()
    const cachedVersion = wikiVersionSelector(state)
    if (
      typeof cachedVersion !== 'undefined' &&
      !vEq(installedVersion, cachedVersion)
    ) {
      dispatch(wikiVersionSet(installedVersion))
      await dispatch(wikiQuestMapRefresh())
    }
    return installedVersion
  }
}

export function kcwikiPreUpgrade (range: string): KcwikiPreUpgradeAction {
  return { type: TabexActionType.KcwikiPreUpgrade, range }
}

export function kcwikiPostUpgrade (
  previousVersion: SemVer,
  currentVersion: SemVer
): KcwikiPostUpgradeAction {
  return {
    type: TabexActionType.KcwikiPostUpgrade, currentVersion, previousVersion
  }
}

export function kcwikiUpgrade (range: string): WikiThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    range = validRange(range)
    if (range === null) { throw new TypeError('invalid version range') }
    dispatch(kcwikiPreUpgrade(range))
    const previous = wikiVersionSelector(getState())
    await upgradeLocalWiki(range)
    // recompute
    const current = await dispatch(wikiVersionValidate())
    dispatch(kcwikiPostUpgrade(previous, current))
  }
}
