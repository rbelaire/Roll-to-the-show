// Canonical batting table (v1) and outcome metadata for UI effects.

import type { DiceTable } from './dice'
import type { OutcomeId } from '../engine/applyOutcome'

export type OutcomeDescription = {
  id: OutcomeId
  label: string
  shortLabel: string
}

// Fixed v1 batting table using Phase 2 OutcomeIds.
// Tuned for ~8 total runs per 3-inning game.
export const battingTable: DiceTable = {
  id: 'batting-v1',
  outcomes: [
    { id: 'K',  weight: 34 },
    { id: 'BB', weight: 7  },
    { id: '1B', weight: 23 },
    { id: '2B', weight: 9  },
    { id: '3B', weight: 2  },
    { id: 'HR', weight: 6  },
    { id: 'DP', weight: 12 },
  ],
}

export const outcomeDescriptions: Record<OutcomeId, OutcomeDescription> = {
  K:    { id: 'K',  label: 'Strikeout',    shortLabel: 'K'  },
  OUT:  { id: 'OUT', label: 'Out',          shortLabel: 'Out' },
  DP:   { id: 'DP', label: 'Double Play',  shortLabel: 'DP' },
  BB:   { id: 'BB', label: 'Walk',          shortLabel: 'BB' },
  '1B': { id: '1B', label: 'Single',        shortLabel: '1B' },
  '2B': { id: '2B', label: 'Double',        shortLabel: '2B' },
  '3B': { id: '3B', label: 'Triple',        shortLabel: '3B' },
  HR:   { id: 'HR', label: 'Home Run',      shortLabel: 'HR' },
}
