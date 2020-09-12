import React from 'react'
import { withTranslation } from 'react-i18next'
import { TabexProps } from '../types'

import { name as PLUGIN_NAME } from '../../package.json'

export const Tabex = withTranslation(PLUGIN_NAME)(
  class extends React.Component<TabexProps> {
    public render (): JSX.Element {
      const { t, apiQuestMap } = this.props
      console.log(apiQuestMap.toJS())
      return (
        <div id={PLUGIN_NAME}>
          {t('Table Top Exercise')}
        </div>
      )
    }
  }
)
