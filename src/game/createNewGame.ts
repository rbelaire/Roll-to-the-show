import { GameState } from './GameState'  export function createNewGame(): GameState {   return {     inning: {       inningNumber: 1,       half: 'top'     },     outs: 0,     bases: {       first: false,       second: false,       third: false     },     home: { runs: 0 },     away: { runs: 0 },     gameOver: false   } }

