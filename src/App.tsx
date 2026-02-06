import { useReducer, useRef, useCallback } from 'react'
import type { RNG } from './game/dice/resolveDice'
import { roll as engineRoll } from './game/engine/gameEngine'
import { battingTable } from './game/types/outcomes'
import { createBrowserRng } from './ui/state/rng'
import { createInitialState, deriveScreen } from './ui/state/uiState'
import { uiReducer } from './ui/state/reducer'
import { TitleScreen } from './ui/screens/TitleScreen'
import { GameScreen } from './ui/screens/GameScreen'
import { GameOverScreen } from './ui/screens/GameOverScreen'
import { SeasonHubScreen } from './ui/screens/SeasonHubScreen'
import { RunHubScreen } from './ui/screens/RunHubScreen'

function App() {
  const [state, dispatch] = useReducer(uiReducer, undefined, createInitialState)
  const rngRef = useRef<RNG>(createBrowserRng())

  const screen = deriveScreen(state)

  const handleRoll = useCallback(() => {
    if (!state.app?.game || state.app.game.gameOver) return

    const result = engineRoll(
      state.app.game,
      { table: battingTable, modifiers: state.modifiers },
      rngRef.current,
    )

    dispatch({
      type: 'ROLL',
      game: result.state,
      effects: result.effects,
      modifiers: result.modifiers,
    })

    if (result.effects.isGameOver) {
      setTimeout(() => dispatch({ type: 'FINISH_GAME' }), 0)
    }
  }, [state.app, state.modifiers])

  switch (screen) {
    case 'title':
      return (
        <TitleScreen
          onSelectMode={mode => dispatch({ type: 'SELECT_MODE', mode })}
        />
      )

    case 'game':
      return (
        <GameScreen
          game={state.app!.game!}
          effects={state.lastRollEffects}
          modifiers={state.modifiers}
          onRoll={handleRoll}
        />
      )

    case 'gameOver':
      return (
        <GameOverScreen
          game={state.app!.game!}
          onContinue={() => dispatch({ type: 'CONTINUE' })}
        />
      )

    case 'seasonHub':
      return (
        <SeasonHubScreen
          season={state.app!.season!}
          onStartGame={() => dispatch({ type: 'START_GAME' })}
          onNewSeason={() => dispatch({ type: 'NEW_SEASON' })}
          onBackToTitle={() => dispatch({ type: 'BACK_TO_TITLE' })}
        />
      )

    case 'runHub':
      return (
        <RunHubScreen
          run={state.app!.run!}
          modifiers={state.modifiers}
          pendingEvent={state.pendingEvent}
          onStartGame={() => dispatch({ type: 'START_GAME' })}
          onResolveEvent={choice => dispatch({ type: 'RESOLVE_EVENT', choice })}
          onNewRun={() => dispatch({ type: 'NEW_RUN' })}
          onBackToTitle={() => dispatch({ type: 'BACK_TO_TITLE' })}
        />
      )
  }
}

export default App
