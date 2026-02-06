import type { Bases } from '../../game/types/gameState'
import styles from './BaseDiamond.module.css'

type Props = {
  bases: Bases
}

export function BaseDiamond({ bases }: Props) {
  return (
    <div className={styles.diamond}>
      <div className={styles.field}>
        <div className={`${styles.base} ${styles.second} ${bases.second ? styles.occupied : ''}`} />
        <div className={`${styles.base} ${styles.third} ${bases.third ? styles.occupied : ''}`} />
        <div className={`${styles.base} ${styles.first} ${bases.first ? styles.occupied : ''}`} />
        <div className={`${styles.base} ${styles.home}`} />
      </div>
    </div>
  )
}
