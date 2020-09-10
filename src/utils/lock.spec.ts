import delay from 'delay'
import { RLock } from './lock'

const enum TestAcquirer {
  A = 'A', B = 'B'
}

test('RLock#acquire(): return what CS returns', async () => {
  expect.assertions(1)

  const lock = new RLock<TestAcquirer>()
  const expectedResult = 100

  const cs = async (): Promise<number> => {
    await delay(1)
    return expectedResult
  }
  const actualResult = await lock.acquire(TestAcquirer.A, cs)
  expect(actualResult).toBe(expectedResult)
})

test('RLock#acquire(): job order', async () => {
  expect.assertions(17)

  const lock = new RLock<TestAcquirer>()
  const startOrder: number[] = []
  const endOrder: number[] = []

  const cs1 = async (): Promise<number> => {
    expect(startOrder).toEqual([])
    expect(endOrder).toEqual([])
    startOrder.push(1)
    await delay(10)
    endOrder.push(1)
    expect(startOrder).toEqual([1, 2])
    expect(endOrder).toEqual([2, 1])
    return 1
  }

  const cs2 = async (): Promise<number> => {
    expect(startOrder).toEqual([1])
    expect(endOrder).toEqual([])
    startOrder.push(2)
    await delay(2)
    endOrder.push(2)
    expect(startOrder).toEqual([1, 2])
    expect(endOrder).toEqual([2])
    return 2
  }

  const cs3 = async (): Promise<number> => {
    expect(startOrder).toEqual([1, 2])
    expect(endOrder).toEqual([2, 1])
    startOrder.push(3)
    await delay(1)
    endOrder.push(3)
    expect(startOrder).toEqual([1, 2, 3])
    expect(endOrder).toEqual([2, 1, 3])
    return 3
  }

  const cs4 = async (): Promise<number> => {
    expect(startOrder).toEqual([1, 2, 3])
    expect(endOrder).toEqual([2, 1, 3])
    startOrder.push(4)
    await delay(1)
    endOrder.push(4)
    expect(startOrder).toEqual([1, 2, 3, 4])
    expect(endOrder).toEqual([2, 1, 3, 4])
    return 4
  }

  const returns = await Promise.all([
    lock.acquire(TestAcquirer.A, cs1),
    lock.acquire(TestAcquirer.A, cs2),
    lock.acquire(TestAcquirer.B, cs3),
    lock.acquire(TestAcquirer.A, cs4)
  ])
  expect(returns).toEqual([1, 2, 3, 4])
})
