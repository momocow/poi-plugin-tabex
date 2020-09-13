import React from 'react'
import i18n from 'i18next'

import  { initReactI18next } from 'react-i18next'

import '@storybook/addon-console'
import { withI18next } from 'storybook-addon-i18next'
import { withTranslation } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    lng: 'zh-TW',
    resources: I18N_RESOURCES
  })

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" }
}

export const decorators = [
  withI18next({
    i18n,
    languages: {
      'zh-TW': '繁體中文'
    }
  }),
  (Story, context) => React.createElement(
    withTranslation()((props) => Story({
      ...context, args: { ...context.args, ...props }
    }))
  )
]
