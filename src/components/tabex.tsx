import React from 'react'
import { name as PLUGIN_NAME } from '../../package.json'
import { TabexProps } from '../types'

export class Tabex extends React.Component<TabexProps> {
  constructor (props: TabexProps) {
    super(props)
    console.log(props)
  }

  public render (): JSX.Element {
    // const { t: t2 } = useTranslation()
    const { t, apiQuestMap } = this.props
    // console.log(this.props, apiQuestMap.toJS(), Date())
    return (
      <div id={PLUGIN_NAME}>
        {t('Table Top Exercise')}
      </div>
    )
  }
}
