import type { RollEffects } from '../../game/engine/gameEngine'
import type { AnimState } from '../screens/GameScreen'
import styles from './OutcomeDisplay.module.css'

type Props = {
  effects: RollEffects | null
  animState?: AnimState
}

function getColorClass(effects: RollEffects): string {
  const { outcomeId } = effects
  if (outcomeId === 'HR') return styles.hr
  if (outcomeId === 'BB') return styles.walk
  if (outcomeId === '1B' || outcomeId === '2B' || outcomeId === '3B') return styles.hit
  return styles.out
}

export function OutcomeDisplay({ effects, animState = 'idle' }: Props) {
  if (animState === 'rolling') {
    return (
      <div className={styles.container}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!effects) {
    return (
      <div className={styles.container}>
        <span className={`${styles.label} ${styles.empty}`}>Roll to play!</span>
      </div>
    )
  }

  const revealClass = animState === 'revealing' ? ` ${styles.reveal}` : ''

  return (
    <div className={styles.container}>
      <span className={`${styles.label} ${getColorClass(effects)}${revealClass}`}>
        {effects.label}
      </span>
      {effects.runsScored > 0 && (
        <span className={`${styles.runs}${revealClass}`}>
          +{effects.runsScored} run{effects.runsScored > 1 ? 's' : ''}!
        </span>
      )}
    </div>
  )
}
