import { useReducer, useRef, useEffect } from 'react'
import type { RNG } from './game/dice/resolveDice'
import { battingTable } from './game/types/outcomes'
import { createBrowserRng } from './ui/state/rng'
import { loadOrCreateInitialState, deriveScreen } from './ui/state/uiState'
import { saveState } from './ui/state/persistence'
import { uiReducer } from './ui/state/reducer'
import { TitleScreen } from './ui/screens/TitleScreen'
import { GameScreen } from './ui/screens/GameScreen'
import { GameOverScreen } from './ui/screens/GameOverScreen'
import { SeasonHubScreen } from './ui/screens/SeasonHubScreen'
import { RunHubScreen } from './ui/screens/RunHubScreen'

function App() {
  const [state, dispatch] = useReducer(uiReducer, undefined, loadOrCreateInitialState)
  const rngRef = useRef<RNG>(createBrowserRng())

  useEffect(() => { saveState(state) }, [state])

  const screen = deriveScreen(state)

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
          rollContext={{ table: battingTable, modifiers: state.modifiers }}
          rng={rngRef.current}
          dispatch={dispatch}
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
