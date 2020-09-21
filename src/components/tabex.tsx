import React from 'react'
import { TabexStore } from '../types'
import { WithTranslation } from 'react-i18next'
import { IConstState, Dictionary } from 'views/utils/selectors'

import { MapSelect } from './MapSelect'
import { APIMstMaparea } from 'kcsapi/api_start2/getData/response'

export interface TabexProps extends TabexStore, WithTranslation {
  mapInfo: IConstState['$maps']
  mapareaInfo: Dictionary<APIMstMaparea>
  activeQuests: any
}

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
      <div className='main'>
        {t('Table Top Exercise')}
        <MapSelect
          maps={Object.values(this.props.mapInfo ?? {})}
          areas={Object.values(this.props.mapareaInfo ?? {})}
          onMapSelect={(map) => console.log(map)}
        />
      </div>
    )
  }
}
