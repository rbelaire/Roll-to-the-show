import type { GameEvent } from '../../game/types/event'
import styles from './EventCard.module.css'

type Props = {
  event: GameEvent
  onChoice: (choice: 0 | 1) => void
}

export function EventCard({ event, onChoice }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>{event.title}</h2>
        <p className={styles.description}>{event.description}</p>
        <div className={styles.choices}>
          <button className={styles.choiceBtn} onClick={() => onChoice(0)}>
            {event.choices[0].text}
          </button>
          <button className={styles.choiceBtn} onClick={() => onChoice(1)}>
            {event.choices[1].text}
          </button>
        </div>
      </div>
    </div>
  )
}
