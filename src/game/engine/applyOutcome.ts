// Phase 2 reducer: applies a resolved OutcomeId to GameState, returns new GameState.
// Pure, deterministic, no RNG.

import type { GameState } from '../state/GameState'
import { advanceRunners } from './advanceRunners'

export type OutcomeId = 'K' | 'OUT' | 'DP' | 'BB' | '1B' | '2B' | '3B' | 'HR'

export function applyOutcome(state: GameState, outcome: OutcomeId): GameState {
  if (state.gameOver) return state

  const next: GameState = {
    ...state,
    bases: { ...state.bases },
  }

  let runsScored = 0

  switch (outcome) {
    case 'K':
    case 'OUT': {
      next.outs += 1
      break
    }

    case 'DP': {
      next.outs = Math.min(next.outs + 2, 3)
      // Remove lead runner (furthest from home)
      if (next.bases.third) next.bases.third = false
      else if (next.bases.second) next.bases.second = false
      else if (next.bases.first) next.bases.first = false
      break
    }

    case 'BB': {
      if (next.bases.first && next.bases.second && next.bases.third) {
        runsScored = 1
        // Bases remain loaded
      } else {
        // Force-advance only: chain from first base
        if (next.bases.first && next.bases.second) {
          next.bases.third = true
        }
        if (next.bases.first) {
          next.bases.second = true
        }
        next.bases.first = true
      }
      break
    }

    case '1B': {
      const result = advanceRunners(next.bases, 1)
      next.bases = { ...result.bases, first: true }
      runsScored = result.runsScored
      break
    }

    case '2B': {
      const result = advanceRunners(next.bases, 2)
      next.bases = { ...result.bases, second: true }
      runsScored = result.runsScored
      break
    }

    case '3B': {
      const result = advanceRunners(next.bases, 3)
      next.bases = { ...result.bases, third: true }
      runsScored = result.runsScored
      break
    }

    case 'HR': {
      const result = advanceRunners(next.bases, 4)
      next.bases = result.bases
      runsScored = result.runsScored + 1
      break
    }
  }

  // Attribute runs to batting team
  if (runsScored > 0) {
    if (next.half === 'top') {
      next.awayScore += runsScored
    } else {
      next.homeScore += runsScored
    }
  }

  // Half-inning transition on 3 outs
  if (next.outs >= 3) {
    next.outs = 0
    next.bases = { first: false, second: false, third: false }

    if (next.half === 'top') {
      next.half = 'bottom'
    } else {
      if (next.inning >= next.totalInnings) {
        next.gameOver = true
      } else {
        next.inning += 1
        next.half = 'top'
      }
    }
  }

  return next
}
