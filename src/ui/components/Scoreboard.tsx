import type { InningHalf } from '../../game/types/gameState'
import styles from './Scoreboard.module.css'

type Props = {
  awayScore: number
  homeScore: number
  inning: number
  half: InningHalf
}

export function Scoreboard({ awayScore, homeScore, inning, half }: Props) {
  const isTop = half === 'top'

  return (
    <div className={styles.scoreboard}>
      <div className={styles.team}>
        <span className={styles.teamLabel}>Away</span>
        <span className={`${styles.score} ${isTop ? styles.batting : ''}`}>
          {awayScore}
        </span>
      </div>

      <div className={styles.inningInfo}>
        <span className={styles.inningLabel}>Inning</span>
        <span className={styles.inningValue}>{inning}</span>
        <span className={styles.halfIndicator}>
          {isTop ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      <div className={styles.team}>
        <span className={styles.teamLabel}>Home</span>
        <span className={`${styles.score} ${!isTop ? styles.batting : ''}`}>
          {homeScore}
        </span>
      </div>
    </div>
  )
}
