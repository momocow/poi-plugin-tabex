import { Tabex } from '@/components/tabex'
import { ApiPartialQuest, TabexProps, WikiQuest } from '@/types'
import { Meta, Story } from '@storybook/react/types-6-0'
import { Map } from 'immutable'
import React from 'react'

// from webpack DefinePlugin runtimeValue
declare const API_QUESTS: [number, ApiPartialQuest][]
declare const WIKI_QUESTS: [number, WikiQuest][]

export default {
  title: 'Main/Tabex',
  component: Tabex
} as Meta

const Template: Story<TabexProps> = (args) => <Tabex {...args} />

export const Demo1 = Template.bind({})
Demo1.args = {
  apiQuestMap: Map<number, ApiPartialQuest>(API_QUESTS),
  wikiQuestMap: Map<number, WikiQuest>(WIKI_QUESTS)
}
