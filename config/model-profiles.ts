import type { ModelProfile } from '../lib/types';

/**
 * Add one sourced profile per tier only after verifying the downstream model's
 * current prices. Empty by default so the app never presents invented costs.
 */
export const MODEL_PROFILES: ModelProfile[] = [];
