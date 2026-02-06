// Simulates one complete game using the Phase 1 dice resolver and Phase 2 outcome reducer.
// Tied games go to a bases-loaded showdown: each team bats with bases loaded
// and 2 outs until someone wins a round.
// No new rules. No UI. All randomness comes from the injected RNG.

import { resolveDice } from '../dice/resolveDice'
import type { RNG } from '../dice/resolveDice'
import { applyOutcome } from '../engine/applyOutcome'
import type { OutcomeId } from '../engine/applyOutcome'
import type { GameState } from '../state/GameState'
import type { DiceTable } from '../types/dice'

// Fixed batting table using Phase 2 OutcomeIds.
// Tuned for ~8 total runs per 3-inning game.
const battingTable: DiceTable = {
  id: 'batting-v1',
  outcomes: [
    { id: 'K',  weight: 34 },
    { id: 'BB', weight: 7  },
    { id: '1B', weight: 23 },
    { id: '2B', weight: 9  },
    { id: '3B', weight: 2  },
    { id: 'HR', weight: 6  },
    { id: 'DP', weight: 12 },
  ],
}

export type GameResult = {
  homeScore: number
  awayScore: number
  totalRuns: number
  innings: number
  showdownRounds: number
}

const MAX_SHOWDOWN_ROUNDS = 50

// Simulate one half-inning of a bases-loaded showdown.
// Returns runs scored in that half.
function showdownHalf(
  rng: RNG,
  half: 'top' | 'bottom',
): number {
  let state: GameState = {
    inning: 1,
    half,
    outs: 2,
    bases: { first: true, second: true, third: true },
    awayScore: 0,
    homeScore: 0,
    totalInnings: 1,
    gameOver: false,
  }

  // Keep rolling until this half ends.
  // Top ends when engine flips to bottom; bottom ends when gameOver.
  while (state.half === half && !state.gameOver) {
    const roll = resolveDice(battingTable, [], rng)
    state = applyOutcome(state, roll.outcomeId as OutcomeId)
  }

  return half === 'top' ? state.awayScore : state.homeScore
}

export function simulateGame(rng: RNG, totalInnings: number = 3): GameResult {
  // --- Regulation game ---
  let state: GameState = {
    inning: 1,
    half: 'top',
    outs: 0,
    bases: { first: false, second: false, third: false },
    awayScore: 0,
    homeScore: 0,
    totalInnings,
    gameOver: false,
  }

  while (!state.gameOver) {
    const roll = resolveDice(battingTable, [], rng)
    state = applyOutcome(state, roll.outcomeId as OutcomeId)
  }

  let homeScore = state.homeScore
  let awayScore = state.awayScore
  let showdownRounds = 0

  // --- Bases-loaded showdown on tie ---
  while (homeScore === awayScore && showdownRounds < MAX_SHOWDOWN_ROUNDS) {
    showdownRounds++
    const awayRuns = showdownHalf(rng, 'top')
    const homeRuns = showdownHalf(rng, 'bottom')
    awayScore += awayRuns
    homeScore += homeRuns
  }

  return {
    homeScore,
    awayScore,
    totalRuns: homeScore + awayScore,
    innings: state.inning,
    showdownRounds,
  }
}
