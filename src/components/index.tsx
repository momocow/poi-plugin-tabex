import { connect } from 'react-redux'
import {
  activeQuestsSelector,
  mapInfoSelector,
  tabexSeletor
} from '../selectors'
import { PoiStore } from '../types'
import { Tabex } from './tabex'

export const PoiTabex = connect(
  (state: PoiStore) => ({
    ...tabexSeletor(state),
    mapInfo: mapInfoSelector(state),
    activeQuests: activeQuestsSelector(state)
  })
)(Tabex)
