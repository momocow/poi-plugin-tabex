// const QUESTLIT_URI = '/kcsapi/api_get_member/questlist'

function handleResponse (e) {
  // const { path, postBody } = e.detail
  console.log(e)
  // if (path === QUESTLIT_URI) {
  //   console.log(postBody)
  // }
}

function pluginDidLoad () {
  window.addEventListener('game.response', handleResponse)
}

function pluginWillUnload () {
  window.removeEventListener('game.response', handleResponse)
}

module.exports = {
  pluginDidLoad,
  pluginWillUnload
  // swithPluginPath: [QUESTLIT_URI]
}
