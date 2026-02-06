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

export const outcomeCommentary: Record<OutcomeId, string[]> = {
  K: [
    'Sat him down swinging.',
    'Caught looking! Take a seat.',
    'Nothing but air on that one.',
    'Whiffed on the heater.',
    'Punch him out!',
  ],
  OUT: [
    'Routine play, one away.',
    'Fielded cleanly. Nothing doing.',
    'Right at him. Easy out.',
    'Can of corn.',
    'Chalk up another out.',
  ],
  DP: [
    'Around the horn! Two gone!',
    'Twin killing!',
    'They turned two on that one.',
    'Bang-bang double play!',
    'Two for the price of one.',
  ],
  BB: [
    'Ball four — take your base.',
    'A free pass to first.',
    'Good eye up there.',
    'Patient at-bat pays off.',
    'Couldn\'t find the zone.',
  ],
  '1B': [
    'Lines one into the outfield.',
    'Slaps it through the infield.',
    'A clean knock to start things off.',
    'Drops one in for a base hit.',
    'Pokes it the other way. Nice hitting.',
  ],
  '2B': [
    'Splits the gap!',
    'Off the wall! Into second standing up.',
    'Ripped into the corner for two.',
    'A screamer down the line!',
    'He\'s legging it into second!',
  ],
  '3B': [
    'Deep to the gap — he\'s going for three!',
    'Rattles around in the corner — triple!',
    'Wheels! He slides in safe at third!',
    'A stand-up triple!',
  ],
  HR: [
    'Gone! Way outta here!',
    'That ball is not coming back.',
    'Kiss it goodbye!',
    'He crushed that one!',
    'Going… going… GONE!',
    'See ya! That one\'s in the seats.',
  ],
}
