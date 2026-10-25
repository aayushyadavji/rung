import type { CostSummaryData, ModelProfile, TaskItem, Tier } from './types';

// Explicitly modeled planning assumptions, not measured usage.
export const TOKEN_ASSUMPTIONS = { input: 1_000, output: 500 } as const;

export function calculateCostSummary(tasks: TaskItem[], profiles: ModelProfile[] = []): CostSummaryData {
  const byTier = new Map<Tier, ModelProfile>(profiles.map(profile => [profile.tier, profile]));
  const tiers: Tier[] = ['light', 'standard', 'frontier'];
  const complete = tiers.every(tier => {
    const profile = byTier.get(tier);
    return profile && profile.sourceUrl && profile.asOf &&
      Number.isFinite(profile.inputUsdPerMillion) && profile.inputUsdPerMillion >= 0 &&
      Number.isFinite(profile.outputUsdPerMillion) && profile.outputUsdPerMillion >= 0;
  });
  const priceSources = complete
    ? Array.from(new Set(profiles.filter(profile => tiers.includes(profile.tier)).map(profile => `${profile.name}: ${profile.sourceUrl} (as of ${profile.asOf})`)))
    : [];

  if (!tasks.length || !complete) {
    return {
      allFrontier: null,
      routedPlan: null,
      savingsPercent: null,
      tokenAssumption: `Assumption per task: ${TOKEN_ASSUMPTIONS.input.toLocaleString()} input + ${TOKEN_ASSUMPTIONS.output.toLocaleString()} output tokens`,
      priceSources,
    };
  }

  const price = (profile: ModelProfile) =>
    TOKEN_ASSUMPTIONS.input / 1_000_000 * profile.inputUsdPerMillion +
    TOKEN_ASSUMPTIONS.output / 1_000_000 * profile.outputUsdPerMillion;
  const frontierPrice = price(byTier.get('frontier')!);
  const allFrontier = frontierPrice * tasks.length;
  const routedPlan = tasks.reduce((sum, task) => sum + price(byTier.get(task.tier)!), 0);

  return {
    allFrontier,
    routedPlan,
    savingsPercent: allFrontier > 0 ? Math.round((allFrontier - routedPlan) / allFrontier * 100) : null,
    tokenAssumption: `Assumption per task: ${TOKEN_ASSUMPTIONS.input.toLocaleString()} input + ${TOKEN_ASSUMPTIONS.output.toLocaleString()} output tokens`,
    priceSources,
  };
}
