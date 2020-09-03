import React from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { PoiStore, TabexProps } from '../types'
import { PLUGIN_NAME, tabexSeletor } from '../utils'

export const Tabex: React.FunctionComponent<TabexProps> = (props) => {
  const { t } = useTranslation(PLUGIN_NAME)
  console.log(props.wikiQuestMap)
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
