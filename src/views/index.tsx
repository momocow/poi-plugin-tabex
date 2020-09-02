import React from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { PLUGIN_NAME } from '../constants'
import { PoiReduxStore, TabexProps } from '../types'

// const QUESTLIT_URI = '/kcsapi/api_get_member/questlist'

export const Tabex = ({ poiQuests }: TabexProps) => {
  const { t } = useTranslation(PLUGIN_NAME)
  return (
    <div id={PLUGIN_NAME}>
      {t('Table Top Exercise')}
    </div>
  )
}

export const PoiTabex = connect(
  (state: PoiReduxStore) => ({
    poiQuests: state.info.quests
  })
)(Tabex)
