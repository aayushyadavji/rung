# Product Requirements: Rung

## Overview

Rung is a risk-aware model-routing planner for developers using AI coding agents. It converts a Markdown PRD into an editable task list, asks a configured hosted AI provider to recommend a capability tier for each task, exposes recommendation evidence and uncertainty, and exports a plan. OpenRouter is preferred when configured, with NVIDIA NIM as a fallback. Rung does not execute code.

## Core journey

1. A builder pastes or uploads their Markdown PRD.
2. Rung parses task-like bullets locally and shows up to 20 candidates.
3. The builder edits titles/descriptions, adds tasks, and removes irrelevant candidates.
4. Before live analysis, Rung states that reviewed task text will be sent to the configured provider.
5. Rung returns one structured recommendation per task and displays mode, model name, tier, effort, confidence, four scores, rationale, and review flags.
6. The builder changes any tier, sees the original recommendation, and exports the selected routes as Markdown.

## Requirements

### PRD input and review

- Accept pasted Markdown and `.md` / plain-text file uploads up to 100,000 characters.
- Extract Markdown list items; if none exist, use specific second-level-or-deeper headings. Ignore generic headings such as Overview, Goals, and Requirements.
- Deduplicate candidates and cap the list at 20, with a visible truncation notice.
- Allow editing each task title and description, adding a task, and removing a task.
- Empty, oversized, or task-free input gets an actionable error and does not call a provider.

### Routing

- Provide `POST /api/route-tasks` for 1–20 reviewed tasks and live analysis.
- OpenRouter is preferred when `OPENROUTER_API_KEY` is configured; otherwise use NVIDIA NIM when `NVIDIA_API_KEY` is configured. Provider keys remain server-side.
- Live mode calls the selected hosted chat-completions API server-side with JSON-schema-constrained output.
- Require exactly one response per input ID, no duplicate or unknown IDs, a tier (`light`, `standard`, `frontier`), effort (`low`, `medium`, `high`), confidence from 0 to 1, four 0-to-1 scores, and a short rationale.
- Reject malformed, incomplete, or out-of-range output as an error; never convert it into a plausible route.
- Report Live only after a valid response from the selected provider. Do not fabricate latency, usage, pricing, or accuracy.

### Review and user control

- Display complexity, ambiguity, cross-file scope, and reasoning-depth scores, each as a percentage.
- Add a human-review flag when confidence is below 0.65, ambiguity is at least 0.65, or any score is at least 0.85.
- Flags do not silently modify a tier.
- Preserve the original recommendation after a user override and identify the selected route as overridden.

### Costs and export

- Downstream model cost is unavailable until all three tiers have profiles with finite non-negative input/output prices, source URLs, and `asOf` dates.
- When configured, use visible assumptions of 1,000 input and 500 output tokens per task; label totals and differences as modeled estimates.
- Do not treat missing prices as zero. Do not count provider API usage unless measured usage and a corresponding price are configured.
- Export mode, model, task descriptions, selected and original tier, effort, confidence, scores, rationale, review flags, cost assumptions, and an implementation-verification reminder as `routing-plan.md`.
- Copy and download actions must not include API credentials.

### Privacy and reliability

- No database, accounts, or persistence of PRDs.
- Keep `OPENROUTER_API_KEY` and `NVIDIA_API_KEY` server-side. Never expose them through public client variables.
- Clearly disclose before Live analysis that reviewed task text is sent to the configured provider.
- Handle missing key, provider authorization failure, 429, timeout, network/provider failure, unreadable response, and schema-validation failure with plain-language messages.
- A failure never returns simulated or fabricated routes.

## Design direction

Keep the Rung visual identity: restrained indigo, distinct tier colors, clear cards, responsive layouts, and score bars. Use labels alongside color. The first screen explains the audience and outcome. Analyze only builder-provided requirements; do not seed fixture PRDs or routing results.

## Success criteria

- A builder-provided PRD can be reviewed and routed end to end when a valid supported provider key is configured.
- A user can inspect a recommendation, override it, and export both the original and selected route.
- No fixture routes can be confused with live output; cost figures never appear without configured sources and assumptions.
- A reviewer can understand the problem and see the working flow in a short public demo video without creating an account.
