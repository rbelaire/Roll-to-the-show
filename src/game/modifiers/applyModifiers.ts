import type { DiceTable, WeightedOutcome } from "../types/dice";
import type { Modifier } from "../types/modifier";

function assertNonNegative(n: number, label: string) {
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${label} must be finite and >= 0 (got ${n})`);
  }
}

export function applyModifiersToTable(
  base: DiceTable,
  modifiers: Modifier[]
): WeightedOutcome[] {
  const weights = new Map<string, number>();

  for (const o of base.outcomes) {
    assertNonNegative(o.weight, `base weight for ${o.id}`);
    weights.set(o.id, o.weight);
  }

  // multiplicative first
  for (const m of modifiers) {
    for (const e of m.effects) {
      if (e.kind !== "mul") continue;
      if (!weights.has(e.outcomeId)) continue;
      assertNonNegative(e.factor, `mul factor for ${e.outcomeId}`);
      weights.set(e.outcomeId, weights.get(e.outcomeId)! * e.factor);
    }
  }

  // additive second
  for (const m of modifiers) {
    for (const e of m.effects) {
      if (e.kind !== "add") continue;
      if (!weights.has(e.outcomeId)) continue;
      const next = weights.get(e.outcomeId)! + e.delta;
      assertNonNegative(next, `add result for ${e.outcomeId}`);
      weights.set(e.outcomeId, next);
    }
  }

  return base.outcomes.map(o => ({
    id: o.id,
    weight: weights.get(o.id)!,
  }));
}
