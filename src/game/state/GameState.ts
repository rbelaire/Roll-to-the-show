// Phase 2 game state — types only, no logic.

export type InningHalf = 'top' | 'bottom'

export type Bases = {
  first: boolean
  second: boolean
  third: boolean
}

export type GameState = {
  inning: number
  half: InningHalf
  outs: number
  bases: Bases
  awayScore: number
  homeScore: number
  totalInnings: number
  gameOver: boolean
}
