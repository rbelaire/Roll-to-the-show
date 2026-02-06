import type { AppState, GameMode, GameState } from '../../game/types/gameState'
import type { RollEffects } from '../../game/engine/gameEngine'
import type { GameEvent } from '../../game/types/event'
import type { Modifier } from '../../game/types/modifier'

export type Screen = 'title' | 'seasonHub' | 'runHub' | 'game' | 'gameOver'

export type UIState = {
  app: AppState | null
  lastRollEffects: RollEffects | null
  pendingEvent: GameEvent | null
  modifiers: Modifier[]
}

export type UIAction =
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'START_GAME' }
  | { type: 'ROLL'; game: GameState; effects: RollEffects; modifiers: Modifier[] }
  | { type: 'FINISH_GAME' }
  | { type: 'CONTINUE' }
  | { type: 'RESOLVE_EVENT'; choice: 0 | 1 }
  | { type: 'NEW_SEASON' }
  | { type: 'NEW_RUN' }
  | { type: 'BACK_TO_TITLE' }

export function createInitialState(): UIState {
  return {
    app: null,
    lastRollEffects: null,
    pendingEvent: null,
    modifiers: [],
  }
}

export function deriveScreen(state: UIState): Screen {
  if (!state.app) return 'title'

  const { app } = state

  if (app.game && app.game.gameOver) return 'gameOver'
  if (app.game && !app.game.gameOver) return 'game'

  if (app.mode === 'standardSeason') return 'seasonHub'
  if (app.mode === 'runToTheShow') return 'runHub'

  return 'title'
}
