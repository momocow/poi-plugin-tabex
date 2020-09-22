const React = require('react')
const { Card } = require('@blueprintjs/core')
const { makeDecorator } = require('@storybook/addons')
const styled = require('styled-components').default
const { useAddonState } = require('@storybook/client-api')

require('poi-asset-themes/dist/blueprint/blueprint-normal.css')
require('./poi-global.css')

const PoiPluginContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const PoiPluginCard = styled(Card)`
  padding: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

const POI_THEMES = {
  'Poi dark': {
    background: '#30404d',
    container: ({ children }) => (
      <PoiPluginContainer className='bp3-dark'>
        <PoiPluginCard>
          {children}
        </PoiPluginCard>
      </PoiPluginContainer>
    )
  }
}

const withPoiTheme = makeDecorator({
  name: 'withPoiTheme',
  parameterName: 'poooi',
  wrapper: (Story, context) => {
    const [ state ] = useAddonState(
      'backgrounds',
      { name: 'Poi dark' }
    )
    const PoiContainer = POI_THEMES[state.name].container
    return <PoiContainer>{Story(context)}</PoiContainer>
  }
})


module.exports = {
  POI_THEMES,
  withPoiTheme
}
