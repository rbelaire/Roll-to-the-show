import type { RunState, TierId } from '../../game/types/gameState'
import type { GameEvent } from '../../game/types/event'
import type { Modifier } from '../../game/types/modifier'
import { TIER_ORDER } from '../../game/modes/runToTheShow'
import { EventCard } from '../components/EventCard'
import { ModifierList } from '../components/ModifierList'
import styles from './RunHubScreen.module.css'

type Props = {
  run: RunState
  modifiers: Modifier[]
  pendingEvent: GameEvent | null
  onStartGame: () => void
  onResolveEvent: (choice: 0 | 1) => void
  onNewRun: () => void
  onBackToTitle: () => void
}

const TIER_LABELS: Record<TierId, string> = {
  singleA: 'Single-A',
  doubleA: 'Double-A',
  tripleA: 'Triple-A',
  theShow: 'The Show',
}

function getTierRowClass(tierId: TierId, run: RunState): string {
  const tier = run.tiers[tierId]
  const currentIdx = TIER_ORDER.indexOf(run.currentTier)
  const tierIdx = TIER_ORDER.indexOf(tierId)

  if (run.runOver && tierId === run.currentTier && !run.promoted) return styles.failed
  if (tier.gamesPlayed >= tier.gamesRequired && tier.wins >= tier.winsRequired) return styles.complete
  if (tierIdx < currentIdx) return styles.complete
  if (tierId === run.currentTier) return styles.current
  return styles.future
}

export function RunHubScreen({
  run, modifiers, pendingEvent,
  onStartGame, onResolveEvent, onNewRun, onBackToTitle,
}: Props) {
  const currentTier = run.tiers[run.currentTier]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Run to the Show
        </h2>
        {!run.runOver && (
          <p className={styles.subtitle}>
            <span className={styles.tierName}>{TIER_LABELS[run.currentTier]}</span>
            {' \u2014 '}Game {currentTier.gamesPlayed + 1} of {currentTier.gamesRequired}
          </p>
        )}
      </div>

      <div className={styles.tierProgress}>
        {TIER_ORDER.map(tierId => {
          const tier = run.tiers[tierId]
          return (
            <div key={tierId} className={`${styles.tierRow} ${getTierRowClass(tierId, run)}`}>
              <span className={styles.tierLabel}>{TIER_LABELS[tierId]}</span>
              <span className={styles.tierRecord}>
                {tier.wins}W-{tier.losses}L / {tier.winsRequired}W needed
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.record}>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.wins}`}>{currentTier.wins}</span>
          <span className={styles.statLabel}>Wins</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.losses}`}>{currentTier.losses}</span>
          <span className={styles.statLabel}>Losses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{currentTier.gamesRequired - currentTier.gamesPlayed}</span>
          <span className={styles.statLabel}>Remaining</span>
        </div>
      </div>

      {modifiers.length > 0 && (
        <div className={styles.modifiers}>
          <ModifierList modifiers={modifiers} />
        </div>
      )}

      {run.runOver && (
        <div className={styles.endState}>
          {run.promoted ? (
            <>
              <h3 className={`${styles.endTitle} ${styles.victory}`}>Champion!</h3>
              <p className={styles.endMsg}>You made it to The Show and won. Incredible run!</p>
            </>
          ) : (
            <>
              <h3 className={`${styles.endTitle} ${styles.eliminated}`}>Run Over</h3>
              <p className={styles.endMsg}>
                Eliminated at {TIER_LABELS[run.currentTier]}. Better luck next time.
              </p>
            </>
          )}
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.actions}>
        {!run.runOver ? (
          <button className={styles.playBtn} onClick={onStartGame}>
            Play Game {currentTier.gamesPlayed + 1}
          </button>
        ) : (
          <button className={styles.playBtn} onClick={onNewRun}>
            New Run
          </button>
        )}
        <button className={styles.backBtn} onClick={onBackToTitle}>
          Back to Title
        </button>
      </div>

      {pendingEvent && (
        <EventCard event={pendingEvent} onChoice={onResolveEvent} />
      )}
    </div>
  )
}
