import React from 'react'
import { MenuItem } from '@blueprintjs/core'
import { Select, ItemRenderer } from '@blueprintjs/select'
import {
  APIMstMaparea, APIMstMapinfo
} from 'kcsapi/api_start2/getData/response'

const mapareaItemRenderer: ItemRenderer<APIMstMaparea> =
  (area, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        text={`${area.api_id}-X ${area.api_name}`}
        onClick={handleClick}
      />
    )
  }

const mapItemRenderer: ItemRenderer<APIMstMapinfo> =
  (map, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        text={`${map.api_maparea_id}-${map.api_no} ${map.api_name}`}
        onClick={handleClick}
      />
    )
  }

function getMapsByArea (
  maps: APIMstMapinfo[], area: APIMstMaparea
): APIMstMapinfo[] {
  return maps.filter(map => map.api_maparea_id === area.api_id)
}

export interface MapSelectProps {
  areas: APIMstMaparea[]
  maps: APIMstMapinfo[]
  onMapSelect: (map: APIMstMapinfo) => void
}

export const MapSelect: React.FC<MapSelectProps> =
  ({ areas, maps, onMapSelect }) => {
    const [activeArea, setActiveArea] = React.useState(areas[0])
    const activeMaps = getMapsByArea(maps, activeArea)
    const [activeMap, setActiveMap] = React.useState(activeMaps[0])

    function onAreaSelect (area: APIMstMaparea): void {
      const areaDefaultMap = getMapsByArea(maps, area)[0]
      setActiveMap(areaDefaultMap)
      setActiveArea(area)
      onMapSelect(areaDefaultMap)
    }

    return (
      <>
        <Select
          filterable={false}
          items={areas}
          activeItem={activeArea}
          itemRenderer={mapareaItemRenderer}
          onItemSelect={onAreaSelect}
        />
        <Select
          filterable={false}
          items={activeMaps}
          activeItem={activeMap}
          itemRenderer={mapItemRenderer}
          onItemSelect={(map) => {
            setActiveMap(map)
            onMapSelect(map)
          }}
        />
      </>
    )
  }
