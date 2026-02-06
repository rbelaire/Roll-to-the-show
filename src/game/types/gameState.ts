// Root application state and mode-level types.
// All types are JSON-serializable.

import type { GameState } from '../state/GameState'
import type { Modifier } from './modifier'

export type { GameState, Bases, InningHalf } from '../state/GameState'

export type GameMode = 'standardSeason' | 'runToTheShow'

// --- Standard Season ---

export type SeasonState = {
  gamesPlayed: number
  wins: number
  losses: number
  runsScored: number
  runsAllowed: number
  totalGames: number
}

// --- Run to the Show (rogue-like) ---

export type TierId = 'singleA' | 'doubleA' | 'tripleA' | 'theShow'

export type TierState = {
  id: TierId
  gamesPlayed: number
  wins: number
  losses: number
  gamesRequired: number
  winsRequired: number
}

export type RunState = {
  currentTier: TierId
  tiers: Record<TierId, TierState>
  modifiers: Modifier[]
  runOver: boolean
  promoted: boolean
}

// --- Meta / Settings ---

export type MetaState = {
  totalRuns: number
  totalWins: number
}

export type SettingsState = {
  inningsPerGame: number
}

// --- Root ---

export type AppState = {
  mode: GameMode
  game: GameState | null
  season: SeasonState | null
  run: RunState | null
  meta: MetaState
  settings: SettingsState
}
