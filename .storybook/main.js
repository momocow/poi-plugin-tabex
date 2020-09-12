const webpackConfig = require('./webpack.config')
const _mergeWith = require('lodash/mergeWith')

function appendArrayItem (objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

// if (process.platform !== 'win32') {
//   throw new Error('Storybook preview is only currently available on Windows')
// }

// const ASAR_BIN = path.join(require.resolve('asar'), 'bin', 'asar.js')
// const POI_SRC_GLOBAL = path.join(process.env.LOCALAPPDATA, 'Programs', 'poi', 'resources', 'app.asar')
// const POI_SRC_LOCAL = path.join(__dirname, 'poi')

module.exports = {
  stories: [
    "./stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config) => {
    // if (!existsSync(POI_SRC)) {
    //   await fork(ASAR_BIN, ['extract', POI_SRC_GLOBAL, POI_SRC_LOCAL], {
    //     stdio: 'ignore'
    //   })
    // }
    return _mergeWith(config, webpackConfig, appendArrayItem)
  }
}
