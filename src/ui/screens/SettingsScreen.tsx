import { useState } from 'react'
import type { SettingsState, GameMode } from '../../game/types/gameState'
import type { UIAction } from '../state/uiState'
import styles from './SettingsScreen.module.css'

type Props = {
  settings: SettingsState
  mode: GameMode
  hasSeason: boolean
  dispatch: (action: UIAction) => void
}

export function SettingsScreen({ settings, mode, hasSeason, dispatch }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

  const showResetSeason = mode === 'standardSeason' && hasSeason

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
      </div>

      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Innings per game</span>
        <div className={styles.stepper}>
          <button
            className={styles.stepperBtn}
            disabled={settings.inningsPerGame <= 1}
            onClick={() =>
              dispatch({ type: 'UPDATE_SETTINGS', settings: { inningsPerGame: settings.inningsPerGame - 1 } })
            }
          >
            -
          </button>
          <span className={styles.stepperValue}>{settings.inningsPerGame}</span>
          <button
            className={styles.stepperBtn}
            disabled={settings.inningsPerGame >= 9}
            onClick={() =>
              dispatch({ type: 'UPDATE_SETTINGS', settings: { inningsPerGame: settings.inningsPerGame + 1 } })
            }
          >
            +
          </button>
        </div>
      </div>

      {showResetSeason && (
        <div className={styles.dangerZone}>
          <span className={styles.dangerLabel}>Reset current season and start fresh</span>
          {!confirmReset ? (
            <button className={styles.resetBtn} onClick={() => setConfirmReset(true)}>
              Reset Season
            </button>
          ) : (
            <button className={styles.resetBtn} onClick={() => dispatch({ type: 'RESET_SEASON' })}>
              Confirm Reset
            </button>
          )}
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => dispatch({ type: 'CLOSE_SETTINGS' })}>
          Back
        </button>
      </div>
    </div>
  )
}
