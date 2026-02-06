// Unified engine API: startNewGame() and roll().
// Wires Phase 1 dice resolution to Phase 2 outcome application.
// Pure functions, no side effects, no RNG ownership.

import { resolveDice } from '../dice/resolveDice'
import type { RNG } from '../dice/resolveDice'
import { applyOutcome } from './applyOutcome'
import type { OutcomeId } from './applyOutcome'
import type { GameState } from '../state/GameState'
import type { DiceTable } from '../types/dice'
import type { Modifier } from '../types/modifier'
import { outcomeDescriptions } from '../types/outcomes'
import { tickRoll } from '../modifiers/expireModifiers'

// --- Public types ---

export type RollEffects = {
  outcomeId: OutcomeId
  label: string
  runsScored: number
  outsRecorded: number
  isHalfInningOver: boolean
  isGameOver: boolean
}

export type RollResult = {
  state: GameState
  effects: RollEffects
  modifiers: Modifier[]
}

export type RollContext = {
  table: DiceTable
  modifiers: Modifier[]
}

// --- Public functions ---

export function startNewGame(inningsPerGame: number = 3): GameState {
  return {
    inning: 1,
    half: 'top',
    outs: 0,
    bases: { first: false, second: false, third: false },
    awayScore: 0,
    homeScore: 0,
    totalInnings: inningsPerGame,
    gameOver: false,
  }
}

export function roll(state: GameState, context: RollContext, rng: RNG): RollResult {
  if (state.gameOver) {
    return {
      state,
      effects: {
        outcomeId: 'K',
        label: 'Game Over',
        runsScored: 0,
        outsRecorded: 0,
        isHalfInningOver: false,
        isGameOver: true,
      },
      modifiers: context.modifiers,
    }
  }

  const resolution = resolveDice(context.table, context.modifiers, rng)
  const outcomeId = resolution.outcomeId as OutcomeId
  const next = applyOutcome(state, outcomeId)

  const totalScoreBefore = state.awayScore + state.homeScore
  const totalScoreAfter = next.awayScore + next.homeScore
  const runsScored = totalScoreAfter - totalScoreBefore

  const halfChanged = next.half !== state.half || next.inning !== state.inning
  const isHalfInningOver = halfChanged || next.gameOver

  // Outs recorded: if the half changed, outs reset to 0, so compute from 3.
  const outsRecorded = isHalfInningOver
    ? 3 - state.outs
    : next.outs - state.outs

  const desc = outcomeDescriptions[outcomeId]
  const updatedModifiers = tickRoll(context.modifiers)

  return {
    state: next,
    effects: {
      outcomeId,
      label: desc?.label ?? outcomeId,
      runsScored,
      outsRecorded,
      isHalfInningOver,
      isGameOver: next.gameOver,
    },
    modifiers: updatedModifiers,
  }
}
