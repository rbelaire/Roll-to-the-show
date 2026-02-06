import { describe, it, expect } from 'vitest'
import { startNewGame, roll } from '../../src/game/engine/gameEngine'
import type { RollContext } from '../../src/game/engine/gameEngine'
import type { GameState } from '../../src/game/state/GameState'
import type { Modifier } from '../../src/game/types/modifier'
import { battingTable } from '../../src/game/types/outcomes'

const rngWith = (x: number) => ({ nextFloat: () => x })

const defaultCtx: RollContext = { table: battingTable, modifiers: [] }

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    inning: 1,
    half: 'top',
    outs: 0,
    bases: { first: false, second: false, third: false },
    awayScore: 0,
    homeScore: 0,
    totalInnings: 3,
    gameOver: false,
    ...overrides,
  }
}

// The batting table weights sum to 93. Cumulative ranges:
// K: 0–34 (p≈0.3656), BB: 34–41 (p≈0.0753), 1B: 41–64 (p≈0.2473)
// 2B: 64–73 (p≈0.0968), 3B: 73–75 (p≈0.0215), HR: 75–81 (p≈0.0645)
// DP: 81–93 (p≈0.1290)

describe('startNewGame', () => {
  it('creates a valid initial state', () => {
    const state = startNewGame()
    expect(state.inning).toBe(1)
    expect(state.half).toBe('top')
    expect(state.outs).toBe(0)
    expect(state.bases).toEqual({ first: false, second: false, third: false })
    expect(state.awayScore).toBe(0)
    expect(state.homeScore).toBe(0)
    expect(state.totalInnings).toBe(3)
    expect(state.gameOver).toBe(false)
  })

  it('accepts custom innings', () => {
    const state = startNewGame(9)
    expect(state.totalInnings).toBe(9)
  })
})

describe('roll', () => {
  it('returns a strikeout with rng=0.0 (first bucket is K)', () => {
    const result = roll(makeState(), defaultCtx, rngWith(0.0))
    expect(result.effects.outcomeId).toBe('K')
    expect(result.effects.label).toBe('Strikeout')
    expect(result.effects.outsRecorded).toBe(1)
    expect(result.effects.runsScored).toBe(0)
    expect(result.state.outs).toBe(1)
  })

  it('returns a single with rng=0.50 (mid 1B bucket)', () => {
    const result = roll(makeState(), defaultCtx, rngWith(0.50))
    expect(result.effects.outcomeId).toBe('1B')
    expect(result.effects.label).toBe('Single')
    expect(result.effects.outsRecorded).toBe(0)
    expect(result.state.bases.first).toBe(true)
  })

  it('returns a home run with rng=0.82 (HR bucket)', () => {
    const state = makeState({ bases: { first: true, second: true, third: false } })
    const result = roll(state, defaultCtx, rngWith(0.82))
    expect(result.effects.outcomeId).toBe('HR')
    expect(result.effects.label).toBe('Home Run')
    expect(result.effects.runsScored).toBe(3) // 2 runners + batter
    expect(result.effects.outsRecorded).toBe(0)
  })

  it('detects half-inning over on 3rd out', () => {
    const state = makeState({ outs: 2 })
    const result = roll(state, defaultCtx, rngWith(0.0)) // K
    expect(result.effects.outsRecorded).toBe(1)
    expect(result.effects.isHalfInningOver).toBe(true)
    expect(result.state.half).toBe('bottom')
    expect(result.state.outs).toBe(0)
  })

  it('detects game over after final inning', () => {
    const state = makeState({ inning: 3, half: 'bottom', outs: 2 })
    const result = roll(state, defaultCtx, rngWith(0.0)) // K
    expect(result.effects.isGameOver).toBe(true)
    expect(result.effects.isHalfInningOver).toBe(true)
    expect(result.state.gameOver).toBe(true)
  })

  it('is a no-op on already-finished game', () => {
    const state = makeState({ gameOver: true })
    const result = roll(state, defaultCtx, rngWith(0.5))
    expect(result.state).toBe(state) // same reference
    expect(result.effects.isGameOver).toBe(true)
    expect(result.effects.label).toBe('Game Over')
  })

  it('attributes runs to away team in top half', () => {
    const state = makeState({
      half: 'top',
      bases: { first: true, second: true, third: true },
    })
    const result = roll(state, defaultCtx, rngWith(0.82)) // HR
    expect(result.state.awayScore).toBe(4)
    expect(result.state.homeScore).toBe(0)
  })

  it('attributes runs to home team in bottom half', () => {
    const state = makeState({
      half: 'bottom',
      bases: { first: true, second: true, third: true },
    })
    const result = roll(state, defaultCtx, rngWith(0.82)) // HR
    expect(result.state.homeScore).toBe(4)
    expect(result.state.awayScore).toBe(0)
  })

  it('works with modifiers', () => {
    // Double the HR weight — should shift distribution
    const ctx: RollContext = {
      table: battingTable,
      modifiers: [{
        id: 'power-boost',
        name: 'Power Boost',
        scope: 'game',
        duration: { kind: 'gamesRemaining', remaining: 1 },
        effects: [{ kind: 'mul', outcomeId: 'HR', factor: 3 }],
      }],
    }
    // With 3x HR weight (18 instead of 6), total becomes 105.
    // HR range shifts. Run many rolls and check HR appears.
    let hrCount = 0
    let seed = 0
    for (let i = 0; i < 100; i++) {
      seed = (seed + 0x6D2B79F5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      const v = ((t ^ (t >>> 14)) >>> 0) / 4294967296
      const result = roll(makeState(), ctx, rngWith(v))
      if (result.effects.outcomeId === 'HR') hrCount++
    }
    expect(hrCount).toBeGreaterThan(5) // should be ~17%
  })

  it('returns modifiers in result', () => {
    const result = roll(makeState(), defaultCtx, rngWith(0.0))
    expect(result.modifiers).toEqual([])
  })

  it('decrements rollsRemaining in returned modifiers', () => {
    const mod: Modifier = {
      id: 'temp',
      name: 'Temp',
      scope: 'game',
      duration: { kind: 'rollsRemaining', remaining: 3 },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.5 }],
    }
    const ctx: RollContext = { table: battingTable, modifiers: [mod] }
    const result = roll(makeState(), ctx, rngWith(0.0))
    expect(result.modifiers).toHaveLength(1)
    expect(result.modifiers[0].duration).toEqual({ kind: 'rollsRemaining', remaining: 2 })
  })

  it('removes modifier when rollsRemaining expires', () => {
    const mod: Modifier = {
      id: 'temp',
      name: 'Temp',
      scope: 'game',
      duration: { kind: 'rollsRemaining', remaining: 1 },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.5 }],
    }
    const ctx: RollContext = { table: battingTable, modifiers: [mod] }
    const result = roll(makeState(), ctx, rngWith(0.0))
    expect(result.modifiers).toHaveLength(0)
  })

  it('returns modifiers unchanged on game-over no-op', () => {
    const mod: Modifier = {
      id: 'perm',
      name: 'Perm',
      scope: 'run',
      duration: { kind: 'runEnd' },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 2 }],
    }
    const ctx: RollContext = { table: battingTable, modifiers: [mod] }
    const state = makeState({ gameOver: true })
    const result = roll(state, ctx, rngWith(0.5))
    expect(result.modifiers).toHaveLength(1)
    expect(result.modifiers[0].id).toBe('perm')
  })
})
