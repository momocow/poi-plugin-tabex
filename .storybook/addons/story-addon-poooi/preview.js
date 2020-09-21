const { withPoiTheme, POI_THEMES } = require('./themes')

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
  withPoiTheme()
]
