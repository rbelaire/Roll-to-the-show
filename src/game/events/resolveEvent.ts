// Resolves a player's event choice by adding the chosen modifiers to the run.

import type { RunState } from '../types/gameState'
import type { GameEvent } from '../types/event'

export function resolveEvent(
  run: RunState,
  event: GameEvent,
  choice: 0 | 1,
): RunState {
  const chosen = event.choices[choice]
  return {
    ...run,
    modifiers: [...run.modifiers, ...chosen.modifiers],
  }
}
