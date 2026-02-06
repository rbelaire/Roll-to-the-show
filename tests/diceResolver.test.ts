import { describe, it, expect } from "vitest";
import { resolveDice } from "../src/game/dice/resolveDice";
import type { DiceTable } from "../src/game/types/dice";
import type { Modifier } from "../src/game/types/modifier";

const table: DiceTable = {
  id: "basic",
  outcomes: [
    { id: "A", weight: 1 },
    { id: "B", weight: 1 },
    { id: "C", weight: 2 },
  ],
};

const rngWith = (x: number) => ({ nextFloat: () => x });

describe("dice resolver", () => {
  it("normalizes probabilities to 1", () => {
    const res = resolveDice(table, [], rngWith(0.1));
    const sum = res.distribution.outcomes.reduce((s, o) => s + o.p, 0);
    expect(sum).toBeGreaterThan(0.999999);
    expect(sum).toBeLessThan(1.000001);
  });

  it("applies multiplicative then additive modifiers", () => {
    const mods: Modifier[] = [
      {
        id: "m1",
        name: "mul A",
        scope: "game",
        duration: { kind: "rollsRemaining", remaining: 1 },
        effects: [{ kind: "mul", outcomeId: "A", factor: 2 }],
      },
      {
        id: "m2",
        name: "add A",
        scope: "game",
        duration: { kind: "rollsRemaining", remaining: 1 },
        effects: [{ kind: "add", outcomeId: "A", delta: 1 }],
      },
    ];

    const res = resolveDice(table, mods, rngWith(0.0));
    const pA = res.distribution.outcomes.find(o => o.id === "A")!.p;
    expect(pA).toBeGreaterThan(0.49);
    expect(pA).toBeLessThan(0.51);
  });

  it("is deterministic with the same RNG value", () => {
    const r1 = resolveDice(table, [], rngWith(0.74)).outcomeId;
    const r2 = resolveDice(table, [], rngWith(0.74)).outcomeId;
    expect(r1).toBe(r2);
  });
});
