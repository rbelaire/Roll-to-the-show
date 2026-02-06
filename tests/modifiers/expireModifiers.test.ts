import { describe, it, expect } from 'vitest'
import { tickRoll, tickGame, tickTier, tickRun } from '../../src/game/modifiers/expireModifiers'
import type { Modifier } from '../../src/game/types/modifier'

function makeMod(overrides: Partial<Modifier> & Pick<Modifier, 'id' | 'duration' | 'scope'>): Modifier {
  return {
    name: overrides.id,
    effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.5 }],
    ...overrides,
  }
}

describe('tickRoll', () => {
  it('decrements rollsRemaining', () => {
    const mods = [makeMod({ id: 'a', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 3 } })]
    const result = tickRoll(mods)
    expect(result).toHaveLength(1)
    expect(result[0].duration).toEqual({ kind: 'rollsRemaining', remaining: 2 })
  })

  it('removes modifier when rollsRemaining hits 0', () => {
    const mods = [makeMod({ id: 'a', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 1 } })]
    const result = tickRoll(mods)
    expect(result).toHaveLength(0)
  })

  it('does not affect non-roll durations', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'game', duration: { kind: 'gamesRemaining', remaining: 5 } }),
      makeMod({ id: 'b', scope: 'tier', duration: { kind: 'tierEnd' } }),
      makeMod({ id: 'c', scope: 'run', duration: { kind: 'runEnd' } }),
    ]
    const result = tickRoll(mods)
    expect(result).toHaveLength(3)
    expect(result.map(m => m.id)).toEqual(['a', 'b', 'c'])
  })

  it('handles mixed roll and non-roll modifiers', () => {
    const mods = [
      makeMod({ id: 'roll-2', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 2 } }),
      makeMod({ id: 'roll-1', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 1 } }),
      makeMod({ id: 'perm', scope: 'tier', duration: { kind: 'tierEnd' } }),
    ]
    const result = tickRoll(mods)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('roll-2')
    expect(result[0].duration).toEqual({ kind: 'rollsRemaining', remaining: 1 })
    expect(result[1].id).toBe('perm')
  })

  it('returns empty array when all modifiers expire', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 1 } }),
      makeMod({ id: 'b', scope: 'game', duration: { kind: 'rollsRemaining', remaining: 1 } }),
    ]
    expect(tickRoll(mods)).toEqual([])
  })
})

describe('tickGame', () => {
  it('removes game-scoped modifiers', () => {
    const mods = [makeMod({ id: 'a', scope: 'game', duration: { kind: 'gamesRemaining', remaining: 5 } })]
    const result = tickGame(mods)
    expect(result).toHaveLength(0)
  })

  it('decrements gamesRemaining on non-game-scoped modifiers', () => {
    const mods = [makeMod({ id: 'a', scope: 'tier', duration: { kind: 'gamesRemaining', remaining: 3 } })]
    const result = tickGame(mods)
    expect(result).toHaveLength(1)
    expect(result[0].duration).toEqual({ kind: 'gamesRemaining', remaining: 2 })
  })

  it('removes modifier when gamesRemaining hits 0', () => {
    const mods = [makeMod({ id: 'a', scope: 'tier', duration: { kind: 'gamesRemaining', remaining: 1 } })]
    const result = tickGame(mods)
    expect(result).toHaveLength(0)
  })

  it('preserves tier and run scoped non-game-duration modifiers', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'tier', duration: { kind: 'tierEnd' } }),
      makeMod({ id: 'b', scope: 'run', duration: { kind: 'runEnd' } }),
    ]
    const result = tickGame(mods)
    expect(result).toHaveLength(2)
  })

  it('handles mixed scopes and durations', () => {
    const mods = [
      makeMod({ id: 'game-scope', scope: 'game', duration: { kind: 'tierEnd' } }),
      makeMod({ id: 'tier-games', scope: 'tier', duration: { kind: 'gamesRemaining', remaining: 2 } }),
      makeMod({ id: 'run-perm', scope: 'run', duration: { kind: 'runEnd' } }),
    ]
    const result = tickGame(mods)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('tier-games')
    expect(result[0].duration).toEqual({ kind: 'gamesRemaining', remaining: 1 })
    expect(result[1].id).toBe('run-perm')
  })
})

describe('tickTier', () => {
  it('removes tier-scoped modifiers', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'tier', duration: { kind: 'gamesRemaining', remaining: 5 } }),
      makeMod({ id: 'b', scope: 'tier', duration: { kind: 'tierEnd' } }),
    ]
    const result = tickTier(mods)
    expect(result).toHaveLength(0)
  })

  it('removes tierEnd duration modifiers regardless of scope', () => {
    const mods = [makeMod({ id: 'a', scope: 'run', duration: { kind: 'tierEnd' } })]
    const result = tickTier(mods)
    expect(result).toHaveLength(0)
  })

  it('preserves run-scoped non-tierEnd modifiers', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'run', duration: { kind: 'runEnd' } }),
      makeMod({ id: 'b', scope: 'run', duration: { kind: 'gamesRemaining', remaining: 3 } }),
    ]
    const result = tickTier(mods)
    expect(result).toHaveLength(2)
  })
})

describe('tickRun', () => {
  it('removes all modifiers', () => {
    const mods = [
      makeMod({ id: 'a', scope: 'run', duration: { kind: 'runEnd' } }),
      makeMod({ id: 'b', scope: 'tier', duration: { kind: 'tierEnd' } }),
      makeMod({ id: 'c', scope: 'game', duration: { kind: 'gamesRemaining', remaining: 5 } }),
    ]
    expect(tickRun(mods)).toEqual([])
  })

  it('returns empty for empty input', () => {
    expect(tickRun([])).toEqual([])
  })
})
