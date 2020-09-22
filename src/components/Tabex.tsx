import React from 'react'
import { Tabs, Tab, Icon } from '@blueprintjs/core'
import { TabexStore } from '../types'
import { WithTranslation } from 'react-i18next'
import { IConstState, Dictionary } from 'views/utils/selectors'

import { LookUpByMap } from './LookUpByMap'
import { APIMstMaparea } from 'kcsapi/api_start2/getData/response'
import styled from 'styled-components'

export interface TabexProps extends TabexStore, WithTranslation {
  mapInfo: IConstState['$maps']
  mapareaInfo: Dictionary<APIMstMaparea>
  activeQuests: any
}

const TabexContainer = styled.div`
  .nav-tab-2 {
    width: calc(50% - 20px);
    text-align: center;
  }
`

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
      <TabexContainer className='main'>
        <Tabs large>
          <Tab
            id='map-tab'
            className='nav-tab-2'
            panel={
              <LookUpByMap
                mapInfo={this.props.mapInfo}
                mapareaInfo={this.props.mapareaInfo}
              />
            }
          >
            <Icon icon='geosearch' /> {t('Loop up by map')}
          </Tab>
          <Tab
            id='quest-tab'
            className='nav-tab-2'
          >
            <Icon icon='search-template' /> {t('Loop up by quest')}
          </Tab>
        </Tabs>
      </TabexContainer>
    )
  }
}
