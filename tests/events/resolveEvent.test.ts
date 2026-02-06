import { describe, it, expect } from 'vitest'
import { resolveEvent } from '../../src/game/events/resolveEvent'
import { eventCatalog } from '../../src/game/events/eventCatalog'
import { createRun } from '../../src/game/modes/runToTheShow'
import type { GameEvent } from '../../src/game/types/event'
import type { Modifier } from '../../src/game/types/modifier'

const testEvent: GameEvent = {
  id: 'test-event',
  title: 'Test Event',
  description: 'A test event.',
  choices: [
    {
      text: 'Choice A',
      modifiers: [{
        id: 'mod-a',
        name: 'Mod A',
        scope: 'tier',
        duration: { kind: 'gamesRemaining', remaining: 2 },
        effects: [{ kind: 'mul', outcomeId: 'HR', factor: 2.0 }],
      }],
    },
    {
      text: 'Choice B',
      modifiers: [{
        id: 'mod-b',
        name: 'Mod B',
        scope: 'game',
        duration: { kind: 'gamesRemaining', remaining: 1 },
        effects: [{ kind: 'add', outcomeId: '1B', delta: 5 }],
      }],
    },
  ],
}

describe('resolveEvent', () => {
  it('adds choice 0 modifiers to run state', () => {
    const run = createRun()
    const result = resolveEvent(run, testEvent, 0)
    expect(result.modifiers).toHaveLength(1)
    expect(result.modifiers[0].id).toBe('mod-a')
  })

  it('adds choice 1 modifiers to run state', () => {
    const run = createRun()
    const result = resolveEvent(run, testEvent, 1)
    expect(result.modifiers).toHaveLength(1)
    expect(result.modifiers[0].id).toBe('mod-b')
  })

  it('preserves existing modifiers', () => {
    const existing: Modifier = {
      id: 'existing',
      name: 'Existing',
      scope: 'run',
      duration: { kind: 'runEnd' },
      effects: [{ kind: 'mul', outcomeId: 'K', factor: 0.5 }],
    }
    const run = { ...createRun(), modifiers: [existing] }
    const result = resolveEvent(run, testEvent, 0)
    expect(result.modifiers).toHaveLength(2)
    expect(result.modifiers[0].id).toBe('existing')
    expect(result.modifiers[1].id).toBe('mod-a')
  })

  it('does not mutate original run', () => {
    const run = createRun()
    resolveEvent(run, testEvent, 0)
    expect(run.modifiers).toHaveLength(0)
  })

  it('works with catalog events', () => {
    const event = eventCatalog[0]
    const run = createRun()
    const result = resolveEvent(run, event, 0)
    expect(result.modifiers.length).toBeGreaterThan(0)
    expect(result.modifiers[0].id).toBe(event.choices[0].modifiers[0].id)
  })
})

describe('eventCatalog', () => {
  it('has at least 5 events', () => {
    expect(eventCatalog.length).toBeGreaterThanOrEqual(5)
  })

  it('all events have valid structure', () => {
    for (const event of eventCatalog) {
      expect(event.id).toBeTruthy()
      expect(event.title).toBeTruthy()
      expect(event.description).toBeTruthy()
      expect(event.choices).toHaveLength(2)
      for (const choice of event.choices) {
        expect(choice.text).toBeTruthy()
        expect(Array.isArray(choice.modifiers)).toBe(true)
        expect(choice.modifiers.length).toBeGreaterThan(0)
      }
    }
  })

  it('all events have unique ids', () => {
    const ids = eventCatalog.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
