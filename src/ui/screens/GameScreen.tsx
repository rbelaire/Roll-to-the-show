import type { GameState } from '../../game/types/gameState'
import type { RollEffects } from '../../game/engine/gameEngine'
import type { Modifier } from '../../game/types/modifier'
import { Scoreboard } from '../components/Scoreboard'
import { BaseDiamond } from '../components/BaseDiamond'
import { OutIndicator } from '../components/OutIndicator'
import { OutcomeDisplay } from '../components/OutcomeDisplay'
import { RollButton } from '../components/RollButton'
import { ModifierList } from '../components/ModifierList'
import styles from './GameScreen.module.css'

type Props = {
  game: GameState
  effects: RollEffects | null
  modifiers: Modifier[]
  onRoll: () => void
}

export function GameScreen({ game, effects, modifiers, onRoll }: Props) {
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

      <OutcomeDisplay effects={effects} />

      <div className={styles.spacer} />

      {modifiers.length > 0 && (
        <div className={styles.modifiers}>
          <ModifierList modifiers={modifiers} />
        </div>
      )}

      <RollButton onClick={onRoll} disabled={game.gameOver} />
    </div>
  )
}
