const styled = require('styled-components').default

const PoiDarkFont = styled.div`
  font-family: "Ubuntu", "Helvetica Neue", "Helvetica", "Arial",
    "WenQuanYi Micro Hei", "Microsoft YaHei", "Droid Sans Fallback", sans-serif;
  color: #f5f8fa;
`

module.exports = {
  'Poi dark': {
    background: '#30404d',
    container: PoiDarkFont
  }
}
