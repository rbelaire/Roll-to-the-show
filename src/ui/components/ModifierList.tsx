import type { Modifier } from '../../game/types/modifier'
import styles from './ModifierList.module.css'

type Props = {
  modifiers: Modifier[]
}

function formatDuration(mod: Modifier): string {
  const d = mod.duration
  if (d.kind === 'rollsRemaining') return `${d.remaining}r`
  if (d.kind === 'gamesRemaining') return `${d.remaining}g`
  if (d.kind === 'tierEnd') return 'tier'
  return 'run'
}

export function ModifierList({ modifiers }: Props) {
  if (modifiers.length === 0) return null

  return (
    <div className={styles.container}>
      {modifiers.map(mod => (
        <span key={mod.id} className={styles.badge}>
          {mod.name}
          <span className={styles.duration}>{formatDuration(mod)}</span>
        </span>
      ))}
    </div>
  )
}
