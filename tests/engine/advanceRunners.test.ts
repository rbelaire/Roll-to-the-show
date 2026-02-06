import { describe, it, expect } from 'vitest'
import { advanceRunners } from '../../src/game/engine/advanceRunners'
import type { Bases } from '../../src/game/state/GameState'

const empty: Bases = { first: false, second: false, third: false }

describe('advanceRunners', () => {
  it('empty bases scores nothing', () => {
    const result = advanceRunners(empty, 1)
    expect(result.runsScored).toBe(0)
    expect(result.bases).toEqual(empty)
  })

  it('advance 1: first -> second', () => {
    const result = advanceRunners({ first: true, second: false, third: false }, 1)
    expect(result.bases).toEqual({ first: false, second: true, third: false })
    expect(result.runsScored).toBe(0)
  })

  it('advance 1: second -> third', () => {
    const result = advanceRunners({ first: false, second: true, third: false }, 1)
    expect(result.bases).toEqual({ first: false, second: false, third: true })
    expect(result.runsScored).toBe(0)
  })

  it('advance 1: third -> scores', () => {
    const result = advanceRunners({ first: false, second: false, third: true }, 1)
    expect(result.bases).toEqual(empty)
    expect(result.runsScored).toBe(1)
  })

  it('advance 1: loaded bases scores runner from third', () => {
    const result = advanceRunners({ first: true, second: true, third: true }, 1)
    expect(result.bases).toEqual({ first: false, second: true, third: true })
    expect(result.runsScored).toBe(1)
  })

  it('advance 2: first -> third, second scores', () => {
    const result = advanceRunners({ first: true, second: true, third: false }, 2)
    expect(result.bases).toEqual({ first: false, second: false, third: true })
    expect(result.runsScored).toBe(1)
  })

  it('advance 2: loaded bases scores two', () => {
    const result = advanceRunners({ first: true, second: true, third: true }, 2)
    expect(result.bases).toEqual({ first: false, second: false, third: true })
    expect(result.runsScored).toBe(2)
  })

  it('advance 3: all runners score', () => {
    const result = advanceRunners({ first: true, second: true, third: true }, 3)
    expect(result.bases).toEqual(empty)
    expect(result.runsScored).toBe(3)
  })

  it('advance 4: all runners score', () => {
    const result = advanceRunners({ first: true, second: true, third: true }, 4)
    expect(result.bases).toEqual(empty)
    expect(result.runsScored).toBe(3)
  })
})
