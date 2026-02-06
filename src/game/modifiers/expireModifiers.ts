// Modifier lifetime management: tick durations and remove expired modifiers.
// Pure functions — no side effects.

import type { Modifier } from '../types/modifier'

/** Decrement rollsRemaining; remove modifiers that hit 0. */
export function tickRoll(modifiers: Modifier[]): Modifier[] {
  return modifiers
    .map(m => {
      if (m.duration.kind !== 'rollsRemaining') return m
      const remaining = m.duration.remaining - 1
      return { ...m, duration: { kind: 'rollsRemaining' as const, remaining } }
    })
    .filter(m => m.duration.kind !== 'rollsRemaining' || m.duration.remaining > 0)
}

/** Decrement gamesRemaining; remove game-scoped and expired modifiers. */
export function tickGame(modifiers: Modifier[]): Modifier[] {
  return modifiers
    .filter(m => m.scope !== 'game')
    .map(m => {
      if (m.duration.kind !== 'gamesRemaining') return m
      const remaining = m.duration.remaining - 1
      return { ...m, duration: { kind: 'gamesRemaining' as const, remaining } }
    })
    .filter(m => m.duration.kind !== 'gamesRemaining' || m.duration.remaining > 0)
}

/** Remove tier-scoped modifiers and tierEnd duration modifiers. */
export function tickTier(modifiers: Modifier[]): Modifier[] {
  return modifiers
    .filter(m => m.scope !== 'tier')
    .filter(m => m.duration.kind !== 'tierEnd')
}

/** Remove all modifiers (run is over). */
export function tickRun(_modifiers: Modifier[]): Modifier[] {
  return []
}
