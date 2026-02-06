// Data-driven event catalog for Run to the Show.
// Each event offers two choices with different modifier trade-offs.

import type { GameEvent } from '../types/event'

export const eventCatalog: GameEvent[] = [
  {
    id: 'power-surge',
    title: 'Power Surge',
    description: 'You feel a surge of energy in the batting cage. Focus on power or contact?',
    choices: [
      {
        text: 'Swing for the fences',
        modifiers: [{
          id: 'power-surge-power',
          name: 'Power Surge',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 2 },
          effects: [{ kind: 'mul', outcomeId: 'HR', factor: 1.8 }],
        }],
      },
      {
        text: 'Focus on making contact',
        modifiers: [{
          id: 'power-surge-contact',
          name: 'Contact Focus',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 2 },
          effects: [{ kind: 'mul', outcomeId: '1B', factor: 1.4 }],
        }],
      },
    ],
  },
  {
    id: 'coaching-tip',
    title: 'Coaching Tip',
    description: 'The hitting coach pulls you aside with some advice.',
    choices: [
      {
        text: 'Work on plate discipline',
        modifiers: [{
          id: 'coaching-discipline',
          name: 'Plate Discipline',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 3 },
          effects: [
            { kind: 'mul', outcomeId: 'K', factor: 0.8 },
            { kind: 'mul', outcomeId: 'BB', factor: 1.5 },
          ],
        }],
      },
      {
        text: 'Work on extra-base hits',
        modifiers: [{
          id: 'coaching-xbh',
          name: 'Extra-Base Focus',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 3 },
          effects: [
            { kind: 'mul', outcomeId: '2B', factor: 1.5 },
            { kind: 'mul', outcomeId: '3B', factor: 2.0 },
          ],
        }],
      },
    ],
  },
  {
    id: 'slump',
    title: 'Hitting Slump',
    description: "You've been struggling at the plate lately. How do you respond?",
    choices: [
      {
        text: 'Grind through it',
        modifiers: [{
          id: 'slump-grind',
          name: 'Grinding Through',
          scope: 'game',
          duration: { kind: 'gamesRemaining', remaining: 1 },
          effects: [{ kind: 'mul', outcomeId: 'K', factor: 1.3 }],
        }],
      },
      {
        text: 'Simplify your approach',
        modifiers: [{
          id: 'slump-simplify',
          name: 'Simplified Approach',
          scope: 'game',
          duration: { kind: 'gamesRemaining', remaining: 1 },
          effects: [
            { kind: 'mul', outcomeId: 'HR', factor: 0.5 },
            { kind: 'mul', outcomeId: '1B', factor: 1.3 },
          ],
        }],
      },
    ],
  },
  {
    id: 'new-bat',
    title: 'New Bat',
    description: 'A equipment rep offers you a new bat to try out.',
    choices: [
      {
        text: 'Try the new lumber',
        modifiers: [{
          id: 'new-bat-yes',
          name: 'New Lumber',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 2 },
          effects: [
            { kind: 'mul', outcomeId: 'HR', factor: 1.5 },
            { kind: 'mul', outcomeId: 'DP', factor: 1.2 },
          ],
        }],
      },
      {
        text: 'Stick with your trusty bat',
        modifiers: [{
          id: 'new-bat-no',
          name: 'Trusty Bat',
          scope: 'tier',
          duration: { kind: 'gamesRemaining', remaining: 2 },
          effects: [{ kind: 'mul', outcomeId: 'K', factor: 0.9 }],
        }],
      },
    ],
  },
  {
    id: 'film-study',
    title: 'Film Study',
    description: 'You have time to study film before the next game. What do you focus on?',
    choices: [
      {
        text: 'Study the pitcher',
        modifiers: [{
          id: 'film-pitcher',
          name: 'Pitcher Scouted',
          scope: 'game',
          duration: { kind: 'gamesRemaining', remaining: 1 },
          effects: [
            { kind: 'mul', outcomeId: 'K', factor: 0.7 },
            { kind: 'mul', outcomeId: 'BB', factor: 1.3 },
          ],
        }],
      },
      {
        text: 'Study your own swings',
        modifiers: [{
          id: 'film-self',
          name: 'Swing Tuned',
          scope: 'game',
          duration: { kind: 'gamesRemaining', remaining: 1 },
          effects: [
            { kind: 'mul', outcomeId: '2B', factor: 1.4 },
            { kind: 'mul', outcomeId: '1B', factor: 1.2 },
          ],
        }],
      },
    ],
  },
  {
    id: 'rest-day',
    title: 'Rest Day',
    description: 'You have a rare day off. How do you spend it?',
    choices: [
      {
        text: 'Rest and recover',
        modifiers: [{
          id: 'rest-recover',
          name: 'Well Rested',
          scope: 'tier',
          duration: { kind: 'tierEnd' },
          effects: [
            { kind: 'mul', outcomeId: 'K', factor: 0.9 },
            { kind: 'mul', outcomeId: 'DP', factor: 0.9 },
          ],
        }],
      },
      {
        text: 'Hit the batting cages',
        modifiers: [{
          id: 'rest-cages',
          name: 'Extra Reps',
          scope: 'tier',
          duration: { kind: 'tierEnd' },
          effects: [
            { kind: 'mul', outcomeId: 'HR', factor: 1.3 },
            { kind: 'mul', outcomeId: '2B', factor: 1.2 },
          ],
        }],
      },
    ],
  },
]
