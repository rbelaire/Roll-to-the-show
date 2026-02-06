import { describe, it, expect } from 'vitest'
import {
  createSeason,
  recordGameResult,
  isSeasonComplete,
} from '../../src/game/modes/standardSeason'

describe('standardSeason', () => {
  it('creates a season with defaults', () => {
    const s = createSeason()
    expect(s.totalGames).toBe(20)
    expect(s.gamesPlayed).toBe(0)
    expect(s.wins).toBe(0)
    expect(s.losses).toBe(0)
    expect(s.runsScored).toBe(0)
    expect(s.runsAllowed).toBe(0)
  })

  it('creates a season with custom length', () => {
    const s = createSeason(10)
    expect(s.totalGames).toBe(10)
  })

  it('records a win (home > away)', () => {
    const s = recordGameResult(createSeason(), 5, 3)
    expect(s.gamesPlayed).toBe(1)
    expect(s.wins).toBe(1)
    expect(s.losses).toBe(0)
    expect(s.runsScored).toBe(5)
    expect(s.runsAllowed).toBe(3)
  })

  it('records a loss (away > home)', () => {
    const s = recordGameResult(createSeason(), 2, 4)
    expect(s.wins).toBe(0)
    expect(s.losses).toBe(1)
  })

  it('records a tie as a loss', () => {
    const s = recordGameResult(createSeason(), 3, 3)
    expect(s.wins).toBe(0)
    expect(s.losses).toBe(1)
  })

  it('accumulates across multiple games', () => {
    let s = createSeason(3)
    s = recordGameResult(s, 5, 2) // W
    s = recordGameResult(s, 1, 4) // L
    s = recordGameResult(s, 3, 3) // tie = L
    expect(s.gamesPlayed).toBe(3)
    expect(s.wins).toBe(1)
    expect(s.losses).toBe(2)
    expect(s.runsScored).toBe(9)
    expect(s.runsAllowed).toBe(9)
  })

  it('detects season completion', () => {
    let s = createSeason(2)
    expect(isSeasonComplete(s)).toBe(false)
    s = recordGameResult(s, 1, 0)
    expect(isSeasonComplete(s)).toBe(false)
    s = recordGameResult(s, 0, 1)
    expect(isSeasonComplete(s)).toBe(true)
  })

  it('is immutable', () => {
    const original = createSeason()
    const after = recordGameResult(original, 5, 2)
    expect(original.gamesPlayed).toBe(0)
    expect(after.gamesPlayed).toBe(1)
  })
})
