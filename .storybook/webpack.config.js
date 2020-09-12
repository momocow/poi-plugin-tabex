const path = require('path')
const { DefinePlugin } = require('webpack')
const { readJsonSync } = require('fs-extra')
const { loadQuest } = require('./utils')

const API_QUESTS_JSON = path.resolve(__dirname, 'api-quests.json')
let loadCount = 0

function readApiQuests () {
  if (loadCount++ % 2 === 0) {
    readApiQuests._apiQuestsEntries = Object.entries(
      readJsonSync(API_QUESTS_JSON)
    )
  }
  return readApiQuests._apiQuestsEntries
}
readApiQuests._apiQuestsEntries = []

function toApiQuests (entries) {
  return entries.map(([k, v]) => [Number(k), v])
}

function toWikiQuests (entries) {
  return entries.map(([k, _]) => [Number(k), loadQuest(Number(k))])
}

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    }
  },
  externals: {
    'views': 'PoiViews'
  },
  plugins: [
    new DefinePlugin({
      API_QUESTS: DefinePlugin.runtimeValue(
        () => JSON.stringify(toApiQuests(readApiQuests())),
        [API_QUESTS_JSON]
      ),
      WIKI_QUESTS: DefinePlugin.runtimeValue(
        () => JSON.stringify(toWikiQuests(readApiQuests())),
        [API_QUESTS_JSON]
      )
    })
  ]
}
