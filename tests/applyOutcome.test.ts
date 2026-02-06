import { describe, it, expect } from 'vitest'
import { applyOutcome } from '../src/game/rules/applyOutcome'
import { GameState } from '../src/game/GameState'
import { DiceOutcome } from '../src/game/dice/DiceOutcome'

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    inning: { inningNumber: 1, half: 'top' },
    outs: 0,
    bases: { first: false, second: false, third: false },
    home: { runs: 0 },
    away: { runs: 0 },
    gameOver: false,
    ...overrides
  }
}

function outcome(type: DiceOutcome['type']): DiceOutcome {
  return { type, weight: 1, description: '' }
}

describe('applyOutcome', () => {
  describe('outs', () => {
    it('strikeout adds 1 out', () => {
      const state = createState({ outs: 0 })
      const result = applyOutcome(state, outcome('strikeout'))
      expect(result.outs).toBe(1)
    })

    it('double play adds 2 outs', () => {
      const state = createState({ outs: 0 })
      const result = applyOutcome(state, outcome('double_play'))
      expect(result.outs).toBe(2)
    })

    it('double play clears first base', () => {
      const state = createState({
        outs: 0,
        bases: { first: true, second: false, third: false }
      })
      const result = applyOutcome(state, outcome('double_play'))
      expect(result.bases.first).toBe(false)
    })
  })

  describe('hits score runners', () => {
    it('single scores all runners', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: true, third: true }
      })
      const result = applyOutcome(state, outcome('single'))
      expect(result.away.runs).toBe(3)
      expect(result.bases).toEqual({ first: true, second: false, third: false })
    })

    it('double scores all runners', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: true, third: true }
      })
      const result = applyOutcome(state, outcome('double'))
      expect(result.away.runs).toBe(3)
      expect(result.bases).toEqual({ first: false, second: true, third: false })
    })

    it('triple scores all runners', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: true, third: true }
      })
      const result = applyOutcome(state, outcome('triple'))
      expect(result.away.runs).toBe(3)
      expect(result.bases).toEqual({ first: false, second: false, third: true })
    })

    it('home run scores all runners plus batter', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: true, third: true }
      })
      const result = applyOutcome(state, outcome('home_run'))
      expect(result.away.runs).toBe(4)
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })

    it('solo home run scores 1', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: false, second: false, third: false }
      })
      const result = applyOutcome(state, outcome('home_run'))
      expect(result.away.runs).toBe(1)
    })

    it('error scores all runners', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: false, third: true }
      })
      const result = applyOutcome(state, outcome('error'))
      expect(result.away.runs).toBe(2)
      expect(result.bases).toEqual({ first: true, second: false, third: false })
    })
  })

  describe('walks', () => {
    it('walk with empty bases puts runner on first', () => {
      const state = createState()
      const result = applyOutcome(state, outcome('walk'))
      expect(result.bases).toEqual({ first: true, second: false, third: false })
      expect(result.away.runs).toBe(0)
    })

    it('walk with runner on first advances to second', () => {
      const state = createState({
        bases: { first: true, second: false, third: false }
      })
      const result = applyOutcome(state, outcome('walk'))
      expect(result.bases).toEqual({ first: true, second: true, third: false })
    })

    it('walk with first and second advances to third', () => {
      const state = createState({
        bases: { first: true, second: true, third: false }
      })
      const result = applyOutcome(state, outcome('walk'))
      expect(result.bases).toEqual({ first: true, second: true, third: true })
    })

    it('bases loaded walk scores a run', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: true, second: true, third: true }
      })
      const result = applyOutcome(state, outcome('walk'))
      expect(result.away.runs).toBe(1)
      expect(result.bases).toEqual({ first: true, second: true, third: true })
    })
  })

  describe('half-inning transitions', () => {
    it('3 outs switches from top to bottom', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        outs: 2
      })
      const result = applyOutcome(state, outcome('strikeout'))
      expect(result.outs).toBe(0)
      expect(result.inning).toEqual({ inningNumber: 1, half: 'bottom' })
    })

    it('3 outs in bottom advances to next inning top', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'bottom' },
        outs: 2
      })
      const result = applyOutcome(state, outcome('strikeout'))
      expect(result.outs).toBe(0)
      expect(result.inning).toEqual({ inningNumber: 2, half: 'top' })
    })

    it('3 outs clears the bases', () => {
      const state = createState({
        outs: 2,
        bases: { first: true, second: true, third: false }
      })
      const result = applyOutcome(state, outcome('strikeout'))
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })

    it('double play can end half-inning', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        outs: 2
      })
      const result = applyOutcome(state, outcome('double_play'))
      expect(result.outs).toBe(0)
      expect(result.inning.half).toBe('bottom')
    })
  })

  describe('batting team attribution', () => {
    it('top of inning scores for away team', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'top' },
        bases: { first: false, second: false, third: false }
      })
      const result = applyOutcome(state, outcome('home_run'))
      expect(result.away.runs).toBe(1)
      expect(result.home.runs).toBe(0)
    })

    it('bottom of inning scores for home team', () => {
      const state = createState({
        inning: { inningNumber: 1, half: 'bottom' },
        bases: { first: false, second: false, third: false }
      })
      const result = applyOutcome(state, outcome('home_run'))
      expect(result.home.runs).toBe(1)
      expect(result.away.runs).toBe(0)
    })
  })

  describe('game over', () => {
    it('returns state unchanged if gameOver is true', () => {
      const state = createState({ gameOver: true, outs: 1 })
      const result = applyOutcome(state, outcome('strikeout'))
      expect(result.outs).toBe(1)
      expect(result).toEqual(state)
    })
  })

  describe('immutability', () => {
    it('does not mutate original state', () => {
      const state = createState({
        bases: { first: true, second: false, third: false }
      })
      const original = JSON.stringify(state)
      applyOutcome(state, outcome('home_run'))
      expect(JSON.stringify(state)).toBe(original)
    })
  })
})
