import { getCommonSortiePlan } from './kcwiki'
import { SortiePlan } from '../types'

jest.mock('views/services/plugin-manager/utils', () => ({}), { virtual: true })
jest.mock('../selectors', () => ({}), { virtual: true })
jest.mock('./fs', () => ({}), { virtual: true })

test('getCommonSortiePlan(): normal plans', () => {
  const plan1: SortiePlan = {
    maps: ['1-1', '1-2', '1-3'],
    result: 'S'
  }

  const plan2: SortiePlan = {
    maps: ['1-2', '4-4'],
    result: 'B'
  }

  expect(getCommonSortiePlan(plan1, plan2))
    .toEqual({
      maps: ['1-2'],
      result: 'S'
    })
})

test('getCommonSortiePlan(): no common plan', () => {
  const plan1: SortiePlan = {
    maps: ['1-1', '1-2', '1-3'],
    result: 'S'
  }

  const plan2: SortiePlan = {
    maps: ['3-3', '3-4'],
    result: 'A'
  }

  expect(getCommonSortiePlan(plan1, plan2)).toBeNull()
})

test('getCommonSortiePlan(): plans with wildcard maps', () => {
  const plan1: SortiePlan = {
    result: 'S'
  }

  const plan2: SortiePlan = {
    maps: ['1-2', '4-4'],
    result: 'B'
  }

  const plan3: SortiePlan = {
    result: 'A'
  }

  expect(getCommonSortiePlan(plan1, plan2))
    .toEqual({
      maps: ['1-2', '4-4'],
      result: 'S'
    })

  expect(getCommonSortiePlan(plan1, plan3))
    .toEqual({ result: 'S' })
})

test('getCommonSortiePlan(): plans with クリア result', () => {
  const plan1: SortiePlan = {
    maps: ['1-6'],
    result: 'クリア'
  }

  const plan2: SortiePlan = {
    maps: ['1-2', '1-6'],
    result: 'B'
  }

  expect(getCommonSortiePlan(plan1, plan2))
    .toEqual({
      maps: ['1-6'],
      result: 'B'
    })
})
