import React from 'react'
import { Tabs, Tab, Icon } from '@blueprintjs/core'
import { TabexStore } from '../types'
import { WithTranslation } from 'react-i18next'
import { IConstState, Dictionary } from 'views/utils/selectors'

import { TabexByMap } from './TabexByMap'
import { APIMstMaparea } from 'kcsapi/api_start2/getData/response'
import styled from 'styled-components'

export interface TabexProps extends TabexStore, WithTranslation {
  mapInfo: IConstState['$maps']
  mapareaInfo: Dictionary<APIMstMaparea>
  activeQuests: any
}

const TabexMain = styled.div`
  height: 100%;

  .tabex-tabs {
    height: 100%;

    .tabex-tab-2 {
      width: calc(50% - 20px);
      text-align: center;
    }
  
    .tabex-tab-content {
      width: 100%;
      height: calc(100% - 60px); 
    }
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
      <TabexMain className='tabex-main'>
        <Tabs
          id='tabex-tabs'
          defaultSelectedTabId='tabex-tab-by-map'
          className='tabex-tabs'
          large
        >
          <Tab
            id='tabex-tab-by-map'
            className='tabex-tab tabex-tab-2'
            panelClassName='tabex-tab-content'
            panel={
              <TabexByMap
                mapInfo={this.props.mapInfo}
                mapareaInfo={this.props.mapareaInfo}
              />
            }
          >
            <Icon icon='geosearch' /> {t('Tabex by map')}
          </Tab>
          <Tab
            id='tabex-tab-by-quest'
            className='tabex-tab tabex-tab-2'
            panelClassName='tabex-tab-content'
          >
            <Icon icon='search-template' /> {t('Tabex by quest')}
          </Tab>
        </Tabs>
      </TabexMain>
    )
  }
}
