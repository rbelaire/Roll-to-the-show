import type { UIState, UIAction } from './uiState'
import type { AppState } from '../../game/types/gameState'
import { createAppState } from '../../game/types/app'
import { startNewGame } from '../../game/engine/gameEngine'
import { createSeason, recordGameResult } from '../../game/modes/standardSeason'
import { createRun, recordRunGame } from '../../game/modes/runToTheShow'
import { resolveEvent } from '../../game/events/resolveEvent'
import { eventCatalog } from '../../game/events/eventCatalog'
import { createInitialState } from './uiState'
import { clearState } from './persistence'

function pickRandomEvent(): import('../../game/types/event').GameEvent {
  return eventCatalog[Math.floor(Math.random() * eventCatalog.length)]
}

function shouldFireEvent(app: AppState): boolean {
  if (app.mode !== 'runToTheShow' || !app.run) return false
  const tier = app.run.tiers[app.run.currentTier]
  // Fire event after game 1 of each tier
  return tier.gamesPlayed === 1
}

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SELECT_MODE': {
      const app = createAppState(action.mode)
      if (action.mode === 'runToTheShow') {
        app.run = createRun()
      }
      return {
        ...state,
        app,
        lastRollEffects: null,
        pendingEvent: null,
        modifiers: action.mode === 'runToTheShow' ? [] : [],
      }
    }

    case 'START_GAME': {
      if (!state.app) return state
      const game = startNewGame(state.app.settings.inningsPerGame)
      return {
        ...state,
        app: { ...state.app, game },
        lastRollEffects: null,
      }
    }

    case 'ROLL': {
      if (!state.app) return state
      return {
        ...state,
        app: { ...state.app, game: action.game },
        lastRollEffects: action.effects,
        modifiers: action.modifiers,
      }
    }

    case 'FINISH_GAME': {
      if (!state.app?.game) return state
      const { homeScore, awayScore } = state.app.game
      let app = { ...state.app }

      if (app.mode === 'standardSeason' && app.season) {
        app.season = recordGameResult(app.season, homeScore, awayScore)
      } else if (app.mode === 'runToTheShow' && app.run) {
        app.run = recordRunGame(app.run, homeScore, awayScore)
      }

      // Check if we should fire an event
      const pending = shouldFireEvent(app) ? pickRandomEvent() : null

      return {
        ...state,
        app,
        pendingEvent: pending,
        modifiers: app.run?.modifiers ?? state.modifiers,
      }
    }

    case 'CONTINUE': {
      if (!state.app) return state
      return {
        ...state,
        app: { ...state.app, game: null },
        lastRollEffects: null,
      }
    }

    case 'RESOLVE_EVENT': {
      if (!state.app?.run || !state.pendingEvent) return state
      const updatedRun = resolveEvent(state.app.run, state.pendingEvent, action.choice)
      return {
        ...state,
        app: { ...state.app, run: updatedRun },
        pendingEvent: null,
        modifiers: updatedRun.modifiers,
      }
    }

    case 'NEW_SEASON': {
      const app = createAppState('standardSeason')
      app.season = createSeason()
      return {
        ...state,
        app,
        lastRollEffects: null,
        pendingEvent: null,
        modifiers: [],
      }
    }

    case 'NEW_RUN': {
      const app = createAppState('runToTheShow')
      app.run = createRun()
      return {
        ...state,
        app,
        lastRollEffects: null,
        pendingEvent: null,
        modifiers: [],
      }
    }

    case 'BACK_TO_TITLE': {
      clearState()
      return createInitialState()
    }

    default:
      return state
  }
}
