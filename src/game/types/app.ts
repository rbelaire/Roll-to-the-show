// Factory for creating the initial AppState.

import type { AppState, GameMode } from './gameState'

export function createAppState(mode: GameMode): AppState {
  return {
    mode,
    game: null,
    season: mode === 'standardSeason' ? {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      runsScored: 0,
      runsAllowed: 0,
      totalGames: 20,
    } : null,
    run: null,
    meta: {
      totalRuns: 0,
      totalWins: 0,
    },
    settings: {
      inningsPerGame: 3,
    },
  }
}
