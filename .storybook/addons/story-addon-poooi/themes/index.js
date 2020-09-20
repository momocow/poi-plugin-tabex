const React = require('react')
const { Card } = require('@blueprintjs/core')
const styled = require('styled-components').default

require('poi-asset-themes/dist/blueprint/blueprint-normal.css')
require('./poi-global.css')

const PoiPluginContainer = styled.div`
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
`

const PoiPluginCard = styled(Card)`
  padding: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

module.exports = {
  'Poi dark': {
    background: '#30404d',
    container: ({ children }) => (
      <PoiPluginContainer className='bp3-dark'>
        <PoiPluginCard>
          {children}
        </PoiPluginCard>
      </PoiPluginContainer>
    )
  }
}
