import { useMemo } from 'react'
import type { RollEffects } from '../../game/engine/gameEngine'
import type { AnimState } from '../screens/GameScreen'
import { outcomeCommentary } from '../../game/types/outcomes'
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
  const commentary = useMemo(() => {
    if (!effects) return null
    const pool = outcomeCommentary[effects.outcomeId]
    return pool[Math.floor(Math.random() * pool.length)]
  }, [effects])

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
      {commentary && (
        <span className={`${styles.commentary}${revealClass}`}>{commentary}</span>
      )}
    </div>
  )
}
