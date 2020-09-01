import React from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { PLUGIN_NAME } from '../constants'
import { PoiReduxStore } from '../types'

// const QUESTLIT_URI = '/kcsapi/api_get_member/questlist'

export const Tabex = connect(
  (state: PoiReduxStore) => ({
    quests: state.info.quests
  })
)(({ quests }) => {
  const { t } = useTranslation(PLUGIN_NAME)
  console.log(quests)
  return (
    <div id={PLUGIN_NAME}>
      {t('Table Top Exercise')}
    </div>
  )
})
