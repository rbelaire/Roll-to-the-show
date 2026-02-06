// Pure helper: advance all existing base runners by N positions.
// Does NOT place the batter — caller handles that.
// A runner at position P advances to P + N. If P + N >= 4, the runner scores.

import type { Bases } from '../state/GameState'

export type AdvanceResult = {
  bases: Bases
  runsScored: number
}

export function advanceRunners(bases: Bases, positions: number): AdvanceResult {
  const newBases: Bases = { first: false, second: false, third: false }
  let runsScored = 0

  // first = position 1, second = 2, third = 3, home = 4+
  if (bases.first) {
    const dest = 1 + positions
    if (dest >= 4) runsScored++
    else if (dest === 3) newBases.third = true
    else if (dest === 2) newBases.second = true
  }

  if (bases.second) {
    const dest = 2 + positions
    if (dest >= 4) runsScored++
    else if (dest === 3) newBases.third = true
  }

  if (bases.third) {
    const dest = 3 + positions
    if (dest >= 4) runsScored++
  }

  return { bases: newBases, runsScored }
}
