import { useState } from 'react'
import { createNewGame } from './game/createNewGame'
import { playAtBat } from './game/GameController'
import { GameState } from './game/GameState'

function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createNewGame()
  )
  const [lastOutcome, setLastOutcome] = useState<string>('')

  function handleRoll() {
    const { outcome, nextState } = playAtBat(gameState)
    setGameState(nextState)
    setLastOutcome(outcome.description)
  }

  const battingTeam =
    gameState.inning.half === 'top' ? 'Away' : 'Home'

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Roll to the Show</h1>

      <div>
        <strong>Inning:</strong>{' '}
        {gameState.inning.inningNumber} ({gameState.inning.half})
      </div>

      <div>
        <strong>Outs:</strong> {gameState.outs}
      </div>

      <div>
        <strong>Batting:</strong> {battingTeam}
      </div>

      <div>
        <strong>Score:</strong> Away {gameState.away.runs} – Home{' '}
        {gameState.home.runs}
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Bases:</strong>{' '}
        {gameState.bases.first ? '1B ' : ''}
        {gameState.bases.second ? '2B ' : ''}
        {gameState.bases.third ? '3B ' : '—'}
      </div>

      <button
        onClick={handleRoll}
        style={{ marginTop: 16, padding: 12 }}
      >
        ROLL
      </button>

      <div style={{ marginTop: 16 }}>
        <em>{lastOutcome}</em>
      </div>
    </div>
  )
}

export default App
