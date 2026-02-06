import type { GameMode } from '../../game/types/gameState'
import styles from './TitleScreen.module.css'

type Props = {
  onSelectMode: (mode: GameMode) => void
}

export function TitleScreen({ onSelectMode }: Props) {
  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>Roll to the Show</h1>
        <p className={styles.subtitle}>A dice-based baseball game</p>
      </div>

      <div className={styles.modes}>
        <button
          className={styles.modeBtn}
          onClick={() => onSelectMode('standardSeason')}
        >
          Standard Season
          <span className={styles.modeDesc}>20-game season. Track your record.</span>
        </button>

        <button
          className={styles.modeBtn}
          onClick={() => onSelectMode('runToTheShow')}
        >
          Run to the Show
          <span className={styles.modeDesc}>Climb from Single-A to The Show. One loss streak ends it.</span>
        </button>
      </div>
    </div>
  )
}
