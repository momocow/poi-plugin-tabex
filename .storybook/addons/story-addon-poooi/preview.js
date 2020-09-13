const React = require('react')
const { useAddonState } = require('@storybook/client-api')

const POI_THEMES = require('./themes')

module.exports.parameters = {
  backgrounds: {
    default: 'Poi dark',
    values: Object.entries(POI_THEMES).map(([name, theme]) => ({
      name,
      value: theme.background
    }))
  }
}

module.exports.decorators = [
  (Story, context) => {
    const [ state ] = useAddonState(
      'backgrounds',
      { name: 'Poi dark' }
    )
    const PoiContainer = POI_THEMES[state.name].container
    return <PoiContainer>{Story(context)}</PoiContainer>
  }
]
