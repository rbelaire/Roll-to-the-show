import { describe, it, expect } from 'vitest'
import { applyOutcome } from '../../src/game/engine/applyOutcome'
import type { OutcomeId } from '../../src/game/engine/applyOutcome'
import type { GameState } from '../../src/game/state/GameState'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    inning: 1,
    half: 'top',
    outs: 0,
    bases: { first: false, second: false, third: false },
    awayScore: 0,
    homeScore: 0,
    totalInnings: 3,
    gameOver: false,
    ...overrides,
  }
}

describe('applyOutcome (engine)', () => {

  // --- Singles with runners on ---

  describe('1B (single)', () => {
    it('batter to first, empty bases', () => {
      const result = applyOutcome(makeState(), '1B')
      expect(result.bases).toEqual({ first: true, second: false, third: false })
      expect(result.awayScore).toBe(0)
    })

    it('runner on first advances to second', () => {
      const state = makeState({
        bases: { first: true, second: false, third: false },
      })
      const result = applyOutcome(state, '1B')
      expect(result.bases).toEqual({ first: true, second: true, third: false })
      expect(result.awayScore).toBe(0)
    })

    it('runner on third scores', () => {
      const state = makeState({
        bases: { first: false, second: false, third: true },
      })
      const result = applyOutcome(state, '1B')
      expect(result.bases).toEqual({ first: true, second: false, third: false })
      expect(result.awayScore).toBe(1)
    })

    it('runners on first and third: third scores, first to second', () => {
      const state = makeState({
        bases: { first: true, second: false, third: true },
      })
      const result = applyOutcome(state, '1B')
      expect(result.bases).toEqual({ first: true, second: true, third: false })
      expect(result.awayScore).toBe(1)
    })

    it('bases loaded: third scores, others advance', () => {
      const state = makeState({
        bases: { first: true, second: true, third: true },
      })
      const result = applyOutcome(state, '1B')
      expect(result.bases).toEqual({ first: true, second: true, third: true })
      expect(result.awayScore).toBe(1)
    })
  })

  // --- 2B (double) ---

  describe('2B (double)', () => {
    it('runner on first to third, runner on second scores', () => {
      const state = makeState({
        bases: { first: true, second: true, third: false },
      })
      const result = applyOutcome(state, '2B')
      expect(result.bases).toEqual({ first: false, second: true, third: true })
      expect(result.awayScore).toBe(1)
    })

    it('bases loaded: two score, first to third', () => {
      const state = makeState({
        bases: { first: true, second: true, third: true },
      })
      const result = applyOutcome(state, '2B')
      expect(result.bases).toEqual({ first: false, second: true, third: true })
      expect(result.awayScore).toBe(2)
    })
  })

  // --- Home runs ---

  describe('HR (home run)', () => {
    it('solo home run scores 1', () => {
      const result = applyOutcome(makeState(), 'HR')
      expect(result.awayScore).toBe(1)
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })

    it('grand slam scores 4', () => {
      const state = makeState({
        bases: { first: true, second: true, third: true },
      })
      const result = applyOutcome(state, 'HR')
      expect(result.awayScore).toBe(4)
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })

    it('two runners + batter scores 3', () => {
      const state = makeState({
        bases: { first: true, second: false, third: true },
      })
      const result = applyOutcome(state, 'HR')
      expect(result.awayScore).toBe(3)
    })

    it('bottom half scores for home team', () => {
      const state = makeState({ half: 'bottom' })
      const result = applyOutcome(state, 'HR')
      expect(result.homeScore).toBe(1)
      expect(result.awayScore).toBe(0)
    })
  })

  // --- Walk with bases loaded ---

  describe('BB (walk)', () => {
    it('empty bases: batter to first', () => {
      const result = applyOutcome(makeState(), 'BB')
      expect(result.bases).toEqual({ first: true, second: false, third: false })
      expect(result.awayScore).toBe(0)
    })

    it('runner on first: force to second', () => {
      const state = makeState({
        bases: { first: true, second: false, third: false },
      })
      const result = applyOutcome(state, 'BB')
      expect(result.bases).toEqual({ first: true, second: true, third: false })
    })

    it('runner on second only: no force, stays', () => {
      const state = makeState({
        bases: { first: false, second: true, third: false },
      })
      const result = applyOutcome(state, 'BB')
      expect(result.bases).toEqual({ first: true, second: true, third: false })
    })

    it('runners on first and second: force to third', () => {
      const state = makeState({
        bases: { first: true, second: true, third: false },
      })
      const result = applyOutcome(state, 'BB')
      expect(result.bases).toEqual({ first: true, second: true, third: true })
    })

    it('bases loaded: scores a run, bases stay loaded', () => {
      const state = makeState({
        bases: { first: true, second: true, third: true },
      })
      const result = applyOutcome(state, 'BB')
      expect(result.awayScore).toBe(1)
      expect(result.bases).toEqual({ first: true, second: true, third: true })
    })

    it('runner on third only: no force, stays', () => {
      const state = makeState({
        bases: { first: false, second: false, third: true },
      })
      const result = applyOutcome(state, 'BB')
      expect(result.bases).toEqual({ first: true, second: false, third: true })
      expect(result.awayScore).toBe(0)
    })
  })

  // --- Double play edge cases ---

  describe('DP (double play)', () => {
    it('adds 2 outs', () => {
      const result = applyOutcome(makeState(), 'DP')
      expect(result.outs).toBe(2)
    })

    it('caps at 3 outs total from 2 outs', () => {
      const state = makeState({ outs: 2 })
      const result = applyOutcome(state, 'DP')
      // Transitions half-inning, outs reset
      expect(result.outs).toBe(0)
      expect(result.half).toBe('bottom')
    })

    it('removes lead runner on third', () => {
      const state = makeState({
        bases: { first: true, second: false, third: true },
      })
      const result = applyOutcome(state, 'DP')
      expect(result.bases.third).toBe(false)
      expect(result.bases.first).toBe(true)
    })

    it('removes lead runner on second when third is empty', () => {
      const state = makeState({
        bases: { first: true, second: true, third: false },
      })
      const result = applyOutcome(state, 'DP')
      expect(result.bases.second).toBe(false)
      expect(result.bases.first).toBe(true)
    })

    it('removes runner on first when only runner', () => {
      const state = makeState({
        bases: { first: true, second: false, third: false },
      })
      const result = applyOutcome(state, 'DP')
      expect(result.bases.first).toBe(false)
    })

    it('no runners: just adds outs', () => {
      const result = applyOutcome(makeState(), 'DP')
      expect(result.outs).toBe(2)
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })
  })

  // --- Outs ---

  describe('K and OUT', () => {
    it('K adds 1 out', () => {
      const result = applyOutcome(makeState(), 'K')
      expect(result.outs).toBe(1)
    })

    it('OUT adds 1 out', () => {
      const result = applyOutcome(makeState(), 'OUT')
      expect(result.outs).toBe(1)
    })
  })

  // --- Inning transition after 3 outs ---

  describe('inning transitions', () => {
    it('3rd out in top switches to bottom, same inning', () => {
      const state = makeState({ outs: 2, half: 'top', inning: 1 })
      const result = applyOutcome(state, 'K')
      expect(result.outs).toBe(0)
      expect(result.half).toBe('bottom')
      expect(result.inning).toBe(1)
    })

    it('3rd out in bottom advances to next inning top', () => {
      const state = makeState({ outs: 2, half: 'bottom', inning: 1 })
      const result = applyOutcome(state, 'K')
      expect(result.outs).toBe(0)
      expect(result.half).toBe('top')
      expect(result.inning).toBe(2)
    })

    it('clears bases on transition', () => {
      const state = makeState({
        outs: 2,
        bases: { first: true, second: true, third: true },
      })
      const result = applyOutcome(state, 'K')
      expect(result.bases).toEqual({ first: false, second: false, third: false })
    })

    it('end of final inning bottom sets gameOver', () => {
      const state = makeState({
        outs: 2,
        half: 'bottom',
        inning: 3,
        totalInnings: 3,
      })
      const result = applyOutcome(state, 'K')
      expect(result.gameOver).toBe(true)
      expect(result.outs).toBe(0)
    })

    it('end of final inning top does NOT end game', () => {
      const state = makeState({
        outs: 2,
        half: 'top',
        inning: 3,
        totalInnings: 3,
      })
      const result = applyOutcome(state, 'K')
      expect(result.gameOver).toBe(false)
      expect(result.half).toBe('bottom')
      expect(result.inning).toBe(3)
    })

    it('mid-game bottom transition does NOT end game', () => {
      const state = makeState({
        outs: 2,
        half: 'bottom',
        inning: 1,
        totalInnings: 3,
      })
      const result = applyOutcome(state, 'K')
      expect(result.gameOver).toBe(false)
      expect(result.inning).toBe(2)
      expect(result.half).toBe('top')
    })

    it('DP at 2 outs triggers transition', () => {
      const state = makeState({
        outs: 2,
        half: 'top',
        inning: 2,
      })
      const result = applyOutcome(state, 'DP')
      expect(result.outs).toBe(0)
      expect(result.half).toBe('bottom')
      expect(result.inning).toBe(2)
    })
  })

  // --- Game over guard ---

  describe('gameOver guard', () => {
    it('returns state unchanged when gameOver is true', () => {
      const state = makeState({ gameOver: true, outs: 1 })
      const result = applyOutcome(state, 'HR')
      expect(result).toBe(state)
      expect(result.outs).toBe(1)
    })
  })

  // --- Immutability ---

  describe('immutability', () => {
    it('does not mutate the input state', () => {
      const state = makeState({
        bases: { first: true, second: true, third: true },
      })
      const snapshot = JSON.stringify(state)
      applyOutcome(state, 'HR')
      expect(JSON.stringify(state)).toBe(snapshot)
    })
  })
})
