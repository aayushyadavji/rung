export type Tier = 'light' | 'standard' | 'frontier';
export type Effort = 'low' | 'medium' | 'high';
export type RunMode = 'live';

export interface ScoreBreakdown {
  complexity: number;
  ambiguity: number;
  crossFile: number;
  reasoningDepth: number;
}

export interface TaskDraft {
  id: string;
  title: string;
  description: string;
}

export interface TaskItem extends TaskDraft {
  /** The original AI recommendation, retained after a user override. */
  originalTier: Tier;
  /** The route currently selected by the user. */
  tier: Tier;
  effort: Effort;
  confidence: number; // 0–100, for display
  scores: ScoreBreakdown; // 0–100, for display
  flag: 'review' | null;
  flagReason?: string;
  whyExplanation: string;
  wasOverridden: boolean;
}

export interface RoutingDecision {
  taskId: string;
  tier: Tier;
  effort: Effort;
  confidence: number; // 0–1 from the API
  scores: ScoreBreakdown; // 0–1 from the API
  rationale: string;
}

export interface RoutingResponse {
  mode: RunMode;
  provider: string;
  model: string;
  decisions: RoutingDecision[];
}

export interface RunMetadata {
  mode: RunMode;
  provider: string;
  model: string;
  latencyMs?: number;
}

export interface ModelProfile {
  tier: Tier;
  name: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  sourceUrl: string;
  asOf: string;
}

export interface CostSummaryData {
  allFrontier: number | null;
  routedPlan: number | null;
  savingsPercent: number | null;
  tokenAssumption: string;
  priceSources: string[];
}
