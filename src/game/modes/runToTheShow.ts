// Run to the Show (rogue-like mode): tiered progression from Single-A to The Show.
// Fail a tier's win requirement → run ends immediately.

import type { TierId, TierState, RunState } from '../types/gameState'
import type { Modifier } from '../types/modifier'
import { tickGame, tickTier } from '../modifiers/expireModifiers'

export const TIER_ORDER: TierId[] = ['singleA', 'doubleA', 'tripleA', 'theShow']

export const TIER_CONFIG: Record<TierId, { games: number; winsRequired: number }> = {
  singleA:  { games: 3, winsRequired: 2 },
  doubleA:  { games: 4, winsRequired: 3 },
  tripleA:  { games: 5, winsRequired: 4 },
  theShow:  { games: 7, winsRequired: 4 },
}

function createTierState(id: TierId): TierState {
  const cfg = TIER_CONFIG[id]
  return {
    id,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    gamesRequired: cfg.games,
    winsRequired: cfg.winsRequired,
  }
}

export function createRun(): RunState {
  const tiers = {} as Record<TierId, TierState>
  for (const id of TIER_ORDER) {
    tiers[id] = createTierState(id)
  }
  return {
    currentTier: 'singleA',
    tiers,
    modifiers: [],
    runOver: false,
    promoted: false,
  }
}

function canStillPromote(tier: TierState): boolean {
  const gamesLeft = tier.gamesRequired - tier.gamesPlayed
  return tier.wins + gamesLeft >= tier.winsRequired
}

function nextTier(id: TierId): TierId | null {
  const idx = TIER_ORDER.indexOf(id)
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null
}

export function recordRunGame(
  run: RunState,
  homeScore: number,
  awayScore: number,
): RunState {
  if (run.runOver) return run

  const tierId = run.currentTier
  const tier = run.tiers[tierId]
  const won = homeScore > awayScore

  const updatedTier: TierState = {
    ...tier,
    gamesPlayed: tier.gamesPlayed + 1,
    wins: tier.wins + (won ? 1 : 0),
    losses: tier.losses + (won ? 0 : 1),
  }

  const updatedTiers = { ...run.tiers, [tierId]: updatedTier }
  const postGameModifiers = tickGame(run.modifiers)

  // Elimination: can't meet win requirement anymore
  if (!canStillPromote(updatedTier)) {
    return { ...run, tiers: updatedTiers, modifiers: postGameModifiers, runOver: true }
  }

  // Tier complete: check promotion
  if (updatedTier.gamesPlayed >= updatedTier.gamesRequired) {
    if (updatedTier.wins >= updatedTier.winsRequired) {
      const next = nextTier(tierId)
      if (next === null) {
        // Beat The Show — run is won
        return { ...run, tiers: updatedTiers, modifiers: postGameModifiers, runOver: true, promoted: true }
      }
      const postTierModifiers = tickTier(postGameModifiers)
      return { ...run, tiers: updatedTiers, modifiers: postTierModifiers, currentTier: next }
    }
    // Didn't meet requirement
    return { ...run, tiers: updatedTiers, modifiers: postGameModifiers, runOver: true }
  }

  return { ...run, tiers: updatedTiers, modifiers: postGameModifiers }
}

export function getCurrentTierStatus(run: RunState): TierState {
  return run.tiers[run.currentTier]
}

export function addModifier(run: RunState, modifier: Modifier): RunState {
  return { ...run, modifiers: [...run.modifiers, modifier] }
}
