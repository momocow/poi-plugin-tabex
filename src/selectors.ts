import _get from 'lodash/get'
import { createSelector, Selector } from 'reselect'
import {
  configSelector,
  constSelector,
  extensionSelectorFactory,
  stateSelector
} from 'views/utils/selectors'
import { PoiStore, TabexConfig, TabexStore } from './types'
import { getConfigName as cfg } from './utils'

import { name as PLUGIN_NAME } from '../package.json'

export const tabexSeletor: Selector<PoiStore, TabexStore> =
  extensionSelectorFactory(PLUGIN_NAME)

export const activeQuestsSelector = createSelector(
  stateSelector,
  state => state.info.activeQuests
)

export const mapInfoSelector = createSelector(
  constSelector,
  state => state.$maps
)

export const apiQuestMapSelector = createSelector(
  tabexSeletor,
  state => state.apiQuestMap
)
export const wikiQuestMapSelector = createSelector(
  tabexSeletor,
  state => state.wikiQuestMap
)
export const wikiVersionSelector = createSelector(
  tabexSeletor,
  state => state.wikiVersion
)

export const tabexConfigSelector = createSelector<PoiStore, {}, TabexConfig>(
  configSelector,
  config => ({
    kcwikiVersionRange: _get(config, cfg('kcwikiVersionRange'), '*')
  })
)
