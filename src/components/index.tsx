import _flow from 'lodash/flow'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { name as PLUGIN_NAME } from '../../package.json'
import {
  activeQuestsSelector,
  mapInfoSelector,
  tabexSeletor
} from '../selectors'
import { PoiStore } from '../types'
import { Tabex } from './tabex'

export const PoiTabex = _flow(
  withTranslation(PLUGIN_NAME),
  connect(
    (state: PoiStore) => ({
      ...tabexSeletor(state),
      mapInfo: mapInfoSelector(state),
      activeQuests: activeQuestsSelector(state)
    })
  )
)(Tabex)
