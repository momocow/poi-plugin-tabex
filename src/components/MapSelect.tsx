import React from 'react'
import {
  Button, ButtonGroup, MenuItem, Divider, Tag, Intent
} from '@blueprintjs/core'
import { Select, ItemRenderer } from '@blueprintjs/select'
import {
  APIMstMaparea, APIMstMapinfo
} from 'kcsapi/api_start2/getData/response'
import styled from 'styled-components'

const SelectGroup = styled(ButtonGroup)`
  .map-select-2, .map-select-popover-target {
    display: block;
  }

  .map-select-popover {
    width: 270px;
  }
`

const MASelect = Select.ofType<APIMstMaparea>()
const MPSelect = Select.ofType<APIMstMapinfo>()

const mapareaItemRenderer: ItemRenderer<APIMstMaparea> =
  (area, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        key={area.api_id}
        active={modifiers.active}
        disabled={modifiers.disabled}
        text={area.api_name}
        label={`${area.api_id}-X`}
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
        key={map.api_id}
        active={modifiers.active}
        disabled={modifiers.disabled}
        text={map.api_name}
        label={`${map.api_maparea_id}-${map.api_no}`}
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
      <SelectGroup fill>
        <Tag icon='globe' large intent={Intent.PRIMARY}>
          {`${activeMap.api_maparea_id}-${activeMap.api_no}`}
        </Tag>
        <Divider />
        <MASelect
          className='map-select-2'
          popoverProps={{
            usePortal: false,
            popoverClassName: 'map-select-popover',
            targetClassName: 'map-select-popover-target'
          }}
          filterable={false}
          items={areas}
          activeItem={activeArea}
          itemRenderer={mapareaItemRenderer}
          onItemSelect={onAreaSelect}
        >
          <Button
            fill
            text={activeArea.api_name}
            rightIcon='double-caret-vertical'
          />
        </MASelect>
        <MPSelect
          className='map-select-2'
          popoverProps={{
            usePortal: false,
            popoverClassName: 'map-select-popover',
            targetClassName: 'map-select-popover-target'
          }}
          filterable={false}
          items={activeMaps}
          activeItem={activeMap}
          itemRenderer={mapItemRenderer}
          onItemSelect={(map) => {
            setActiveMap(map)
            onMapSelect(map)
          }}
        >
          <Button
            fill
            text={activeMap.api_name}
            rightIcon='double-caret-vertical'
          />
        </MPSelect>
      </SelectGroup>
    )
  }
