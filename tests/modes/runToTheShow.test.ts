import { describe, it, expect } from 'vitest'
import {
  createRun,
  recordRunGame,
  getCurrentTierStatus,
  addModifier,
  TIER_ORDER,
  TIER_CONFIG,
} from '../../src/game/modes/runToTheShow'
import type { Modifier } from '../../src/game/types/modifier'

describe('runToTheShow', () => {
  it('creates a run starting at Single-A', () => {
    const run = createRun()
    expect(run.currentTier).toBe('singleA')
    expect(run.runOver).toBe(false)
    expect(run.promoted).toBe(false)
    expect(run.modifiers).toEqual([])
  })

  it('initializes all tiers with correct config', () => {
    const run = createRun()
    for (const id of TIER_ORDER) {
      const tier = run.tiers[id]
      expect(tier.id).toBe(id)
      expect(tier.gamesPlayed).toBe(0)
      expect(tier.gamesRequired).toBe(TIER_CONFIG[id].games)
      expect(tier.winsRequired).toBe(TIER_CONFIG[id].winsRequired)
    }
  })

  it('records a win in current tier', () => {
    const run = recordRunGame(createRun(), 5, 2)
    const tier = getCurrentTierStatus(run)
    expect(tier.gamesPlayed).toBe(1)
    expect(tier.wins).toBe(1)
    expect(tier.losses).toBe(0)
    expect(run.currentTier).toBe('singleA')
  })

  it('treats tie as a loss', () => {
    const run = recordRunGame(createRun(), 3, 3)
    const tier = getCurrentTierStatus(run)
    expect(tier.wins).toBe(0)
    expect(tier.losses).toBe(1)
  })

  it('promotes from Single-A to Double-A after meeting requirement', () => {
    let run = createRun()
    run = recordRunGame(run, 5, 0) // W
    run = recordRunGame(run, 5, 0) // W (2/3 met, but only 2 games played)
    expect(run.currentTier).toBe('singleA') // not yet, still have game 3
    run = recordRunGame(run, 0, 5) // L (2W 1L in 3 games → promoted)
    expect(run.currentTier).toBe('doubleA')
    expect(run.runOver).toBe(false)
  })

  it('eliminates when win requirement becomes impossible', () => {
    let run = createRun()
    // Single-A: 3 games, need 2 wins. Lose first 2 → impossible.
    run = recordRunGame(run, 0, 5) // L
    run = recordRunGame(run, 0, 5) // L (0W, 1 game left, need 2 → impossible)
    expect(run.runOver).toBe(true)
    expect(run.promoted).toBe(false)
  })

  it('full run through all tiers to promotion', () => {
    let run = createRun()

    // Single-A: 3 games, need 2W → go 3-0
    for (let i = 0; i < 3; i++) run = recordRunGame(run, 5, 0)
    expect(run.currentTier).toBe('doubleA')

    // Double-A: 4 games, need 3W → go 3-1
    for (let i = 0; i < 3; i++) run = recordRunGame(run, 5, 0)
    run = recordRunGame(run, 0, 5)
    expect(run.currentTier).toBe('tripleA')

    // Triple-A: 5 games, need 4W → go 4-1
    for (let i = 0; i < 4; i++) run = recordRunGame(run, 5, 0)
    run = recordRunGame(run, 0, 5)
    expect(run.currentTier).toBe('theShow')

    // The Show: 7 games, need 4W → go 4-0 then 3L
    for (let i = 0; i < 4; i++) run = recordRunGame(run, 5, 0)
    expect(run.runOver).toBe(false) // still playing
    for (let i = 0; i < 3; i++) run = recordRunGame(run, 0, 5)
    expect(run.runOver).toBe(true)
    expect(run.promoted).toBe(true)
  })

  it('no-ops on already-finished run', () => {
    let run = createRun()
    run = recordRunGame(run, 0, 5)
    run = recordRunGame(run, 0, 5) // eliminated
    expect(run.runOver).toBe(true)
    const frozen = recordRunGame(run, 99, 0)
    expect(frozen).toBe(run)
  })

  it('adds modifiers to run state', () => {
    const mod: Modifier = {
      id: 'test',
      name: 'Test',
      scope: 'run',
      duration: { kind: 'runEnd' },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.5 }],
    }
    const run = addModifier(createRun(), mod)
    expect(run.modifiers).toHaveLength(1)
    expect(run.modifiers[0].id).toBe('test')
  })

  it('is immutable', () => {
    const original = createRun()
    const after = recordRunGame(original, 5, 0)
    expect(original.tiers.singleA.gamesPlayed).toBe(0)
    expect(after.tiers.singleA.gamesPlayed).toBe(1)
  })

  it('removes game-scoped modifiers after a game', () => {
    const mod: Modifier = {
      id: 'game-mod',
      name: 'Game Mod',
      scope: 'game',
      duration: { kind: 'gamesRemaining', remaining: 1 },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 2 }],
    }
    let run = addModifier(createRun(), mod)
    run = recordRunGame(run, 5, 0)
    expect(run.modifiers).toHaveLength(0)
  })

  it('decrements gamesRemaining on tier-scoped modifiers after a game', () => {
    const mod: Modifier = {
      id: 'tier-mod',
      name: 'Tier Mod',
      scope: 'tier',
      duration: { kind: 'gamesRemaining', remaining: 3 },
      effects: [{ kind: 'mul', outcomeId: '1B', factor: 1.5 }],
    }
    let run = addModifier(createRun(), mod)
    run = recordRunGame(run, 5, 0)
    expect(run.modifiers).toHaveLength(1)
    expect(run.modifiers[0].duration).toEqual({ kind: 'gamesRemaining', remaining: 2 })
  })

  it('removes tier-scoped modifiers on tier promotion', () => {
    const tierMod: Modifier = {
      id: 'tier-mod',
      name: 'Tier Mod',
      scope: 'tier',
      duration: { kind: 'tierEnd' },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.5 }],
    }
    const runMod: Modifier = {
      id: 'run-mod',
      name: 'Run Mod',
      scope: 'run',
      duration: { kind: 'runEnd' },
      effects: [{ kind: 'mul', outcomeId: 'BB', factor: 1.2 }],
    }
    let run = addModifier(addModifier(createRun(), tierMod), runMod)

    // Win 2 of 3 in Single-A to promote
    run = recordRunGame(run, 5, 0) // W
    run = recordRunGame(run, 5, 0) // W
    run = recordRunGame(run, 0, 5) // L → promotes to Double-A

    expect(run.currentTier).toBe('doubleA')
    // tier-scoped modifier removed, run-scoped preserved
    expect(run.modifiers).toHaveLength(1)
    expect(run.modifiers[0].id).toBe('run-mod')
  })

  it('preserves run-scoped modifiers through tier promotion', () => {
    const mod: Modifier = {
      id: 'run-mod',
      name: 'Run Mod',
      scope: 'run',
      duration: { kind: 'gamesRemaining', remaining: 10 },
      effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.3 }],
    }
    let run = addModifier(createRun(), mod)

    // Win all 3 in Single-A
    for (let i = 0; i < 3; i++) run = recordRunGame(run, 5, 0)
    expect(run.currentTier).toBe('doubleA')
    // 3 games ticked: 10 - 3 = 7
    expect(run.modifiers).toHaveLength(1)
    expect(run.modifiers[0].duration).toEqual({ kind: 'gamesRemaining', remaining: 7 })
  })
})
