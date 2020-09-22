import { APIMstMaparea } from 'kcsapi/api_start2/getData/response'
import React from 'react'
import styled from 'styled-components'
import { IConstState, Dictionary } from 'views/utils/selectors'
import { MapPicker } from './MapPicker'

const MapSelectBar = styled.div`
  padding: 0 10px;
`

export interface TabexByMapProps {
  fancy?: boolean
  mapInfo?: IConstState['$maps']
  mapareaInfo?: Dictionary<APIMstMaparea>
}

export const TabexByMap: React.FC<TabexByMapProps> =
  ({ mapInfo, mapareaInfo, fancy }) => {
    return (
      <div>
        <MapSelectBar>
          <MapPicker
            maps={Object.values(mapInfo ?? {})}
            areas={Object.values(mapareaInfo ?? {})}
            onMapSelect={(map) => console.log(map)}
          />
        </MapSelectBar>
      </div>
    )
  }
