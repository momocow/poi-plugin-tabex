import React from 'react'
import { Button, ButtonGroup, MenuItem } from '@blueprintjs/core'
import { Select, ItemRenderer, ISelectProps } from '@blueprintjs/select'
import {
  APIMstMaparea, APIMstMapinfo
} from 'kcsapi/api_start2/getData/response'
import styled, { StyledComponent } from 'styled-components'

interface StyledSelectProps {
  width: string
}

const MASelect = styled(Select.ofType<APIMstMaparea>())<StyledSelectProps>`
  display:block;
  width: ${props => props.width};

  .bp3-popover-target {
    display:block;
    width: ${props => props.width};
  }

  .bp3-select-popover {
    width: ${props => props.width};
  }
`

// this should take a function to share with MASelect
// but it was just a hard time to declare the return type
// so copy the styled function here
const MPSelect = styled(Select.ofType<APIMstMapinfo>())<StyledSelectProps>`
display:block;
width: ${props => props.width};

.bp3-popover-target {
  display:block;
  width: ${props => props.width};
}

.bp3-select-popover {
  width: ${props => props.width};
}
`

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
        key={map.api_id}
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
      <ButtonGroup>
        <MASelect
          width='180px'
          popoverProps={{ usePortal: false }}
          filterable={false}
          items={areas}
          activeItem={activeArea}
          itemRenderer={mapareaItemRenderer}
          onItemSelect={onAreaSelect}
        >
          <Button
            fill
            text={`${activeArea.api_id}-X ${activeArea.api_name}`}
            rightIcon='double-caret-vertical'
          />
        </MASelect>
        <MPSelect
          width='240px'
          popoverProps={{ usePortal: false }}
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
            text={
              `${activeMap.api_maparea_id}-${activeMap.api_no} ` +
              `${activeMap.api_name}`
            }
            rightIcon='double-caret-vertical'
          />
        </MPSelect>
      </ButtonGroup>
    )
  }
