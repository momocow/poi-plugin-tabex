import React from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { PLUGIN_NAME, tabexSeletor } from '../utils'
import { PoiStore } from '../types'

export const Tabex: React.FunctionComponent = (props) => {
  const { t } = useTranslation(PLUGIN_NAME)
  return (
    <div id={PLUGIN_NAME}>
      {t('Table Top Exercise')}
    </div>
  )
}

export const PoiTabex = connect(
  (state: PoiStore) => ({
    ...tabexSeletor(state),
    activeQuestMap: state.info.quests.activeQuests
  })
)(Tabex)
