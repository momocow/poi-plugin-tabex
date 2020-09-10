import React from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { PoiStore, TabexProps } from '../types'
import { PLUGIN_NAME } from '../utils'
import { tabexSeletor } from '../selectors'

export const Tabex: React.FunctionComponent<TabexProps> = (props) => {
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
