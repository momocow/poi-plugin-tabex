import { APIMstMaparea } from 'kcsapi/api_start2/getData/response'
import React from 'react'
import { IConstState, Dictionary } from 'views/utils/selectors'
import { MapSelect } from './MapSelect'

export interface LookUpByMapProps {
  mapInfo?: IConstState['$maps']
  mapareaInfo?: Dictionary<APIMstMaparea>
}

export const LookUpByMap: React.FC<LookUpByMapProps> =
  ({ mapInfo, mapareaInfo }) => {
    return (
      <MapSelect
        maps={Object.values(mapInfo ?? {})}
        areas={Object.values(mapareaInfo ?? {})}
        onMapSelect={(map) => console.log(map)}
      />
    )
  }
