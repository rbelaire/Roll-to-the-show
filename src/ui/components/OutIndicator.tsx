import styles from './OutIndicator.module.css'

type Props = {
  outs: number
}

export function OutIndicator({ outs }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Outs</span>
      <div className={styles.dots}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`${styles.dot} ${i < outs ? styles.filled : ''}`} />
        ))}
      </div>
    </div>
  )
}
