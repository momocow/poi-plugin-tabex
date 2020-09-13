const path = require('path')
const { DefinePlugin } = require('webpack')
const { readJsonSync, readdirSync, statSync } = require('fs-extra')
const { loadQuest } = require('./utils')

const I18N_DIR = path.resolve(__dirname, '..', 'i18n')
const API_QUESTS_JSON = path.resolve(__dirname, 'api-quests.json')

const LANG_FILES = readdirSync(I18N_DIR)
  .map(f => path.join(I18N_DIR, f))
  .filter(p => path.extname(p) === '.json' && statSync(p).isFile())

function readApiQuests () {
  if (readApiQuests._loadCount++ % 2 === 0) {
    readApiQuests._apiQuestsEntries = Object.entries(
      readJsonSync(API_QUESTS_JSON)
    )
  }
  return readApiQuests._apiQuestsEntries
}
readApiQuests._apiQuestsEntries = []
readApiQuests._loadCount = 0

function toApiQuests (entries) {
  return entries.map(([k, v]) => [Number(k), v])
}

function toWikiQuests (entries) {
  return entries.map(([k, _]) => [Number(k), loadQuest(Number(k))])
}

function buildI18nResources () {
  return LANG_FILES
    .map(p => [path.basename(p, '.json'), readJsonSync(p)])
    .reduce(
      (acc, [f, p]) => Object.assign(acc, {
        [f]: { translation: p }
      }), {})
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
      ),
      I18N_RESOURCES: DefinePlugin.runtimeValue(
        () => JSON.stringify(buildI18nResources()),
        LANG_FILES
      )
    })
  ]
}
