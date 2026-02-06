import type { GameState } from '../../game/types/gameState'
import styles from './GameOverScreen.module.css'

type Props = {
  game: GameState
  onContinue: () => void
}

export function GameOverScreen({ game, onContinue }: Props) {
  const won = game.homeScore > game.awayScore
  const resultText = won ? 'You Win!' : 'You Lose'

  return (
    <div className={styles.container}>
      <h2 className={`${styles.heading} ${won ? styles.win : styles.loss}`}>
        {resultText}
      </h2>

      <div className={styles.finalScore}>
        <div className={styles.team}>
          <span className={styles.teamLabel}>Away</span>
          <span className={styles.score}>{game.awayScore}</span>
        </div>
        <span className={styles.dash}>&ndash;</span>
        <div className={styles.team}>
          <span className={styles.teamLabel}>Home</span>
          <span className={styles.score}>{game.homeScore}</span>
        </div>
      </div>

      <button className={styles.continueBtn} onClick={onContinue}>
        Continue
      </button>
    </div>
  )
}
