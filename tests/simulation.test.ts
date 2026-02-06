import { describe, it, expect } from 'vitest'
import { simulateGame } from '../src/game/sim/simulateGame'
import { runSimulation } from '../src/game/sim/runSimulation'

const seededRng = (seed: number) => {
  let s = seed | 0
  return {
    nextFloat() {
      s = (s + 0x6D2B79F5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}

describe('simulateGame', () => {
  it('completes a 3-inning game', () => {
    const result = simulateGame(seededRng(1))
    expect(result.innings).toBe(3)
    expect(result.homeScore).toBeGreaterThanOrEqual(0)
    expect(result.awayScore).toBeGreaterThanOrEqual(0)
    expect(result.totalRuns).toBe(result.homeScore + result.awayScore)
  })

  it('is deterministic with the same seed', () => {
    const a = simulateGame(seededRng(99))
    const b = simulateGame(seededRng(99))
    expect(a).toEqual(b)
  })

  it('produces different results with different seeds', () => {
    const results = new Set<string>()
    for (let seed = 0; seed < 20; seed++) {
      const r = simulateGame(seededRng(seed))
      results.add(`${r.awayScore}-${r.homeScore}`)
    }
    expect(results.size).toBeGreaterThan(1)
  })

  it('never ends in a tie (showdown resolves it)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const r = simulateGame(seededRng(seed))
      expect(r.homeScore).not.toBe(r.awayScore)
    }
  })

  it('tracks showdown rounds when regulation ties', () => {
    // Run enough games that at least one showdown occurs
    let sawShowdown = false
    for (let seed = 0; seed < 200; seed++) {
      const r = simulateGame(seededRng(seed))
      if (r.showdownRounds > 0) {
        sawShowdown = true
        expect(r.homeScore).not.toBe(r.awayScore)
        break
      }
    }
    expect(sawShowdown).toBe(true)
  })
})

describe('runSimulation', () => {
  it('runs N games and returns valid summary', () => {
    const summary = runSimulation(100, 42)
    expect(summary.gamesPlayed).toBe(100)
    expect(summary.avgRunsPerGame).toBeGreaterThan(0)
    expect(summary.homeWinRate + summary.awayWinRate + summary.tieRate).toBeCloseTo(1.0)
  })

  it('is deterministic with the same seed', () => {
    const a = runSimulation(50, 7)
    const b = runSimulation(50, 7)
    expect(a.avgRunsPerGame).toBe(b.avgRunsPerGame)
    expect(a.homeWinRate).toBe(b.homeWinRate)
    expect(a.awayWinRate).toBe(b.awayWinRate)
    expect(a.tieRate).toBe(b.tieRate)
  })

  it('score distribution counts sum to N', () => {
    const summary = runSimulation(200, 123)
    let total = 0
    for (const count of summary.scoreDistribution.values()) {
      total += count
    }
    expect(total).toBe(200)
  })

  it('showdown eliminates most ties', () => {
    const summary = runSimulation(500, 42)
    expect(summary.tieRate).toBe(0)
    expect(summary.showdownRate).toBeGreaterThan(0)
  })
})
