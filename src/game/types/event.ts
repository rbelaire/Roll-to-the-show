// Event system types for between-game choices in Run to the Show.

import type { Modifier } from './modifier'

export type EventChoice = {
  text: string
  modifiers: Modifier[]
}

export type GameEvent = {
  id: string
  title: string
  description: string
  choices: [EventChoice, EventChoice]
}
