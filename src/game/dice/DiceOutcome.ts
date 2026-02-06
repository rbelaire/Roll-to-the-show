// Describes a single possible result of a dice roll.
// Pure data model — no logic here.

export type DiceOutcomeType =
  | 'strikeout'
  | 'walk'
  | 'single'
  | 'double'
  | 'triple'
  | 'home_run'
  | 'error'
  | 'double_play'

export type DiceOutcome = {
  type: DiceOutcomeType
  weight: number
  description: string
}
