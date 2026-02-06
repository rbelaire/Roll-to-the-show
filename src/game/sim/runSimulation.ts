// Runs N games using simulateGame and prints aggregate statistics.
// All randomness flows from a single seed.

import { simulateGame } from './simulateGame'
import type { GameResult } from './simulateGame'
import type { RNG } from '../dice/resolveDice'

// mulberry32: fast, seedable 32-bit PRNG. Returns values in [0, 1).
function createRng(seed: number): RNG {
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

export type SimulationSummary = {
  gamesPlayed: number
  avgRunsPerGame: number
  homeWinRate: number
  awayWinRate: number
  tieRate: number
  showdownRate: number
  avgShowdownRounds: number
  scoreDistribution: Map<string, number>
}

export function runSimulation(
  n: number,
  seed: number = 42,
  totalInnings: number = 3,
): SimulationSummary {
  const rng = createRng(seed)
  const results: GameResult[] = []

  for (let i = 0; i < n; i++) {
    results.push(simulateGame(rng, totalInnings))
  }

  let homeWins = 0
  let awayWins = 0
  let ties = 0
  let totalRuns = 0
  let showdownGames = 0
  let totalShowdownRounds = 0
  const scoreDist = new Map<string, number>()

  for (const r of results) {
    totalRuns += r.totalRuns

    if (r.homeScore > r.awayScore) homeWins++
    else if (r.awayScore > r.homeScore) awayWins++
    else ties++

    if (r.showdownRounds > 0) {
      showdownGames++
      totalShowdownRounds += r.showdownRounds
    }

    const key = `${r.awayScore}-${r.homeScore}`
    scoreDist.set(key, (scoreDist.get(key) ?? 0) + 1)
  }

  return {
    gamesPlayed: n,
    avgRunsPerGame: totalRuns / n,
    homeWinRate: homeWins / n,
    awayWinRate: awayWins / n,
    tieRate: ties / n,
    showdownRate: showdownGames / n,
    avgShowdownRounds: showdownGames > 0 ? totalShowdownRounds / showdownGames : 0,
    scoreDistribution: scoreDist,
  }
}

export function printSummary(s: SimulationSummary): void {
  console.log(`\n=== Simulation: ${s.gamesPlayed} games ===`)
  console.log(`Avg runs/game:  ${s.avgRunsPerGame.toFixed(2)}`)
  console.log(`Home win rate:  ${(s.homeWinRate * 100).toFixed(1)}%`)
  console.log(`Away win rate:  ${(s.awayWinRate * 100).toFixed(1)}%`)
  console.log(`Tie rate:       ${(s.tieRate * 100).toFixed(1)}%`)
  console.log(`Showdown rate:  ${(s.showdownRate * 100).toFixed(1)}%`)
  if (s.showdownRate > 0) {
    console.log(`Avg showdown rounds: ${s.avgShowdownRounds.toFixed(2)}`)
  }

  console.log(`\nScore distribution (away-home):`)
  const sorted = [...s.scoreDistribution.entries()]
    .sort((a, b) => b[1] - a[1])
  for (const [score, count] of sorted) {
    const pct = ((count / s.gamesPlayed) * 100).toFixed(1)
    const bar = '#'.repeat(Math.ceil(count / s.gamesPlayed * 50))
    console.log(`  ${score.padStart(6)}  ${String(count).padStart(5)}  ${pct.padStart(5)}%  ${bar}`)
  }
}
