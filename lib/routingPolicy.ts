import type { RoutingDecision, TaskItem } from './types';

export function applyRoutingPolicy(decision: RoutingDecision, task: { id: string; title: string; description: string }): TaskItem {
  const reasons: string[] = [];
  if (decision.confidence < 0.65) reasons.push('AI confidence is below 65%');
  if (decision.scores.ambiguity >= 0.65) reasons.push('Task ambiguity is high');
  if (Object.values(decision.scores).some(score => score >= 0.85)) reasons.push('At least one routing score is 85% or higher');

  return {
    ...task,
    originalTier: decision.tier,
    tier: decision.tier,
    effort: decision.effort,
    confidence: Math.round(decision.confidence * 100),
    scores: {
      complexity: Math.round(decision.scores.complexity * 100),
      ambiguity: Math.round(decision.scores.ambiguity * 100),
      crossFile: Math.round(decision.scores.crossFile * 100),
      reasoningDepth: Math.round(decision.scores.reasoningDepth * 100),
    },
    flag: reasons.length ? 'review' : null,
    flagReason: reasons.join('; '),
    whyExplanation: decision.rationale,
    wasOverridden: false,
  };
}
