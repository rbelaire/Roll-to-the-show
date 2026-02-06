// Standard Season mode: 20-game season, track W/L and runs.
// Ties count as losses per PRD.

import type { SeasonState } from '../types/gameState'

export function createSeason(totalGames: number = 20): SeasonState {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    runsScored: 0,
    runsAllowed: 0,
    totalGames,
  }
}

export function recordGameResult(
  season: SeasonState,
  homeScore: number,
  awayScore: number,
): SeasonState {
  const won = homeScore > awayScore
  return {
    ...season,
    gamesPlayed: season.gamesPlayed + 1,
    wins: season.wins + (won ? 1 : 0),
    losses: season.losses + (won ? 0 : 1),
    runsScored: season.runsScored + homeScore,
    runsAllowed: season.runsAllowed + awayScore,
  }
}

export function isSeasonComplete(season: SeasonState): boolean {
  return season.gamesPlayed >= season.totalGames
}
