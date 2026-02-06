import { useState, useRef, useEffect, useCallback } from 'react'
import type { Dispatch } from 'react'
import type { GameState } from '../../game/types/gameState'
import type { RollEffects, RollContext } from '../../game/engine/gameEngine'
import type { RNG } from '../../game/dice/resolveDice'
import type { Modifier } from '../../game/types/modifier'
import type { UIAction } from '../state/uiState'
import { roll as engineRoll } from '../../game/engine/gameEngine'
import { Scoreboard } from '../components/Scoreboard'
import { BaseDiamond } from '../components/BaseDiamond'
import { OutIndicator } from '../components/OutIndicator'
import { OutcomeDisplay } from '../components/OutcomeDisplay'
import { RollButton } from '../components/RollButton'
import { ModifierList } from '../components/ModifierList'
import styles from './GameScreen.module.css'

export type AnimState = 'idle' | 'rolling' | 'revealing'

type Props = {
  game: GameState
  effects: RollEffects | null
  modifiers: Modifier[]
  rollContext: RollContext
  rng: RNG
  dispatch: Dispatch<UIAction>
}

export function GameScreen({ game, effects, modifiers, rollContext, rng, dispatch }: Props) {
  const [animState, setAnimState] = useState<AnimState>('idle')
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout)
    }
  }, [])

  const handleRoll = useCallback(() => {
    if (game.gameOver || animState !== 'idle') return

    const result = engineRoll(game, rollContext, rng)

    setAnimState('rolling')

    const revealTimer = setTimeout(() => {
      setAnimState('revealing')

      dispatch({
        type: 'ROLL',
        game: result.state,
        effects: result.effects,
        modifiers: result.modifiers,
      })

      if (result.effects.isGameOver) {
        setTimeout(() => dispatch({ type: 'FINISH_GAME' }), 0)
      }

      const idleTimer = setTimeout(() => {
        setAnimState('idle')
      }, 300)
      timeoutIds.current.push(idleTimer)
    }, 700)

    timeoutIds.current.push(revealTimer)
  }, [game, rollContext, rng, dispatch, animState])

  return (
    <div className={styles.container}>
      <Scoreboard
        awayScore={game.awayScore}
        homeScore={game.homeScore}
        inning={game.inning}
        half={game.half}
      />

      <div className={styles.field}>
        <BaseDiamond bases={game.bases} />
        <OutIndicator outs={game.outs} />
      </div>

      <OutcomeDisplay effects={effects} animState={animState} />

      <div className={styles.spacer} />

      {modifiers.length > 0 && (
        <div className={styles.modifiers}>
          <ModifierList modifiers={modifiers} />
        </div>
      )}

      <RollButton onClick={handleRoll} disabled={game.gameOver || animState !== 'idle'} />
    </div>
  )
}
