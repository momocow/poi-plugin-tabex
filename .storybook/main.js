const webpackConfig = require('./webpack.config')
const _mergeWith = require('lodash/mergeWith')

function appendArrayItem (objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

module.exports = {
  stories: [
    './stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-i18next'
  ],
  webpackFinal: async (config) => {
    return _mergeWith(config, webpackConfig, appendArrayItem)
  }
}
