import type { RollEffects } from '../../game/engine/gameEngine'
import styles from './OutcomeDisplay.module.css'

type Props = {
  effects: RollEffects | null
}

function getColorClass(effects: RollEffects): string {
  const { outcomeId } = effects
  if (outcomeId === 'HR') return styles.hr
  if (outcomeId === 'BB') return styles.walk
  if (outcomeId === '1B' || outcomeId === '2B' || outcomeId === '3B') return styles.hit
  return styles.out
}

export function OutcomeDisplay({ effects }: Props) {
  if (!effects) {
    return (
      <div className={styles.container}>
        <span className={`${styles.label} ${styles.empty}`}>Roll to play!</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <span className={`${styles.label} ${getColorClass(effects)}`}>
        {effects.label}
      </span>
      {effects.runsScored > 0 && (
        <span className={styles.runs}>
          +{effects.runsScored} run{effects.runsScored > 1 ? 's' : ''}!
        </span>
      )}
    </div>
  )
}
