import type { SeasonState } from '../../game/types/gameState'
import { isSeasonComplete } from '../../game/modes/standardSeason'
import styles from './SeasonHubScreen.module.css'

type Props = {
  season: SeasonState
  onStartGame: () => void
  onNewSeason: () => void
  onBackToTitle: () => void
}

export function SeasonHubScreen({ season, onStartGame, onNewSeason, onBackToTitle }: Props) {
  const complete = isSeasonComplete(season)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Standard Season</h2>
        <p className={styles.subtitle}>
          Game {season.gamesPlayed + 1} of {season.totalGames}
        </p>
      </div>

      <div className={styles.record}>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.wins}`}>{season.wins}</span>
          <span className={styles.statLabel}>Wins</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.losses}`}>{season.losses}</span>
          <span className={styles.statLabel}>Losses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{season.runsScored}</span>
          <span className={styles.statLabel}>RS</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{season.runsAllowed}</span>
          <span className={styles.statLabel}>RA</span>
        </div>
      </div>

      {complete && (
        <div className={styles.complete}>
          <h3 className={styles.completeTitle}>Season Complete!</h3>
          <p className={styles.completeMsg}>
            Final record: {season.wins}-{season.losses}
          </p>
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.actions}>
        {!complete ? (
          <button className={styles.playBtn} onClick={onStartGame}>
            Play Game {season.gamesPlayed + 1}
          </button>
        ) : (
          <button className={styles.playBtn} onClick={onNewSeason}>
            New Season
          </button>
        )}
        <button className={styles.backBtn} onClick={onBackToTitle}>
          Back to Title
        </button>
      </div>
    </div>
  )
}
