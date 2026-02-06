export type OutcomeId = string;

export type WeightedOutcome = {
  id: OutcomeId;
  weight: number; // non-negative, not normalized
};

export type DiceTable = {
  id: string;
  outcomes: WeightedOutcome[];
};

export type ResolvedDistribution = {
  outcomes: { id: OutcomeId; p: number }[];
};

export type DiceResolutionResult = {
  outcomeId: OutcomeId;
  distribution: ResolvedDistribution;
};
