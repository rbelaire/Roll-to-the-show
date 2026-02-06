import type { DiceTable, DiceResolutionResult } from "../types/dice";
import type { Modifier } from "../types/modifier";
import { applyModifiersToTable } from "../modifiers/applyModifiers";

export type RNG = {
  nextFloat: () => number; // must return [0, 1)
};

function normalize(weights: { id: string; weight: number }[]) {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error(`invalid distribution total: ${total}`);
  }

  const outcomes = weights.map(w => ({
    id: w.id,
    p: w.weight / total,
  }));

  const sum = outcomes.reduce((s, o) => s + o.p, 0);
  if (sum < 0.999999 || sum > 1.000001) {
    throw new Error(`normalization failed (sum=${sum})`);
  }

  return outcomes;
}

export function resolveDice(
  table: DiceTable,
  modifiers: Modifier[],
  rng: RNG
): DiceResolutionResult {
  const weighted = applyModifiersToTable(table, modifiers);
  const dist = normalize(weighted);

  const r = rng.nextFloat();
  if (!Number.isFinite(r) || r < 0 || r >= 1) {
    throw new Error(`rng must return [0,1), got ${r}`);
  }

  let acc = 0;
  for (const o of dist) {
    acc += o.p;
    if (r < acc) {
      return {
        outcomeId: o.id,
        distribution: { outcomes: dist },
      };
    }
  }

  return {
    outcomeId: dist[dist.length - 1].id,
    distribution: { outcomes: dist },
  };
}
