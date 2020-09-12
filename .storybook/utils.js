const { readJsonSync } = require('fs-extra')

function loadQuest (gameId) {
  const targetFilename = `kcwiki-quest-data/data/${gameId}.json`
  const questJsonFile = require.resolve(targetFilename)
  return readJsonSync(questJsonFile)
}

module.exports = {
  loadQuest
}
