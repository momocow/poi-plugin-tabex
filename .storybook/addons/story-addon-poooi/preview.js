const { withPoiTheme, POI_THEMES } = require('./themes')

module.exports.parameters = {
  viewport: {
    defaultViewport: 'poiFullHDCanvas100%',
    viewports: {
      'poiFullHDCanvas100%': {
        name: 'Poi Full HD, Canvas 100% ',
        styles: {
          width: '700px', // 1920 - 1200
          height: '100%'
        }
      }
    }
  },
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
