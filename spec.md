# Technical Specification: Rung

## Stack and runtime

- Next.js 15.5.28 App Router, React 18, and TypeScript. Next.js 15.5.28 is the patched release used for this deployment; keep it current with supported security releases.
- Vercel Web Analytics via `@vercel/analytics/next` in the root layout; collection is activated after enabling it for the Vercel project and deploying. Analytics receives page-view events only; PRD contents are not sent as custom events.
- Browser-local state for PRD text, extracted tasks, results, and overrides. No database or account system.
- Next.js Node.js route handler for server-to-server provider requests. OpenRouter takes priority; NVIDIA NIM is the fallback when OpenRouter is not configured.
- OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`; default model `openai/gpt-4o-mini`, configurable via server-only `OPENROUTER_MODEL_ID`.
- NVIDIA hosted endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`; fallback model `nvidia/nemotron-3.5-super-vl-120b-a12b`, configurable via server-only `NVIDIA_MODEL_ID`.
- Secrets: `OPENROUTER_API_KEY` and `NVIDIA_API_KEY`; never expose them to client bundles or commit real values.

## Components and data flow

1. `LandingPage` explains Rung and opens the real PRD workflow.
2. `MainDashboard` accepts pasted/uploaded Markdown and keeps a task-review state before routing.
3. `lib/parsePrd.ts` extracts bullets locally, falls back to specific headings, deduplicates, and caps at 20.
4. The browser posts reviewed `{ id, title, description }` records in live mode to `/api/route-tasks`.
5. The server validates request shape and bounds, then calls the selected provider with a fixed JSON Schema and bounded output budget. NVIDIA requests set `reasoning_effort` to `none` to favor schema-constrained JSON.
6. The server verifies complete one-to-one task coverage and score ranges, then returns structured decisions.
7. `lib/routingPolicy.ts` applies deterministic review flags without changing tiers. The dashboard shows the recommendations, score evidence, rationale, and model/mode metadata.
8. `TaskReview` preserves an original AI tier alongside the user's selected tier. Cost estimates are computed separately in `lib/cost.ts`; `config/model-profiles.ts` is empty until sourced prices are configured.
9. `ExportPlan` generates Markdown from current task state; it does not execute anything.

## Internal API

`POST /api/route-tasks`

Request:

```json
{
  "mode": "live",
  "tasks": [{ "id": "task-1", "title": "Add search", "description": "Filter the task list by title." }]
}
```

Response:

```json
{
  "mode": "live",
  "provider": "NVIDIA NIM",
  "model": "nvidia/nemotron-3.5-super-vl-120b-a12b",
  "decisions": [{
    "taskId": "task-1",
    "tier": "light",
    "effort": "low",
    "confidence": 0.82,
    "scores": { "complexity": 0.2, "ambiguity": 0.1, "crossFile": 0.2, "reasoningDepth": 0.2 },
    "rationale": "A focused list filter with a clear input and bounded behavior."
  }]
}
```

The example values are illustrative only. The server validates task IDs, tier/effort enums, finite 0-to-1 confidence and scores, rationale length, uniqueness, and full task coverage. The browser converts normalized numbers to percentages for display.

## Deterministic review policy

- Flag for review if confidence `< 0.65`, ambiguity `>= 0.65`, or any score `>= 0.85`.
- Do not alter a recommendation in response to a flag.
- A user override changes the selected tier but preserves the original tier.

## Cost model

- Profiles map each tier to a display name, input/output USD per million tokens, source URL, and `asOf` date.
- No default prices are supplied. All three profiles must be complete before displaying totals.
- Assumptions per task: 1,000 input and 500 output tokens.
- `estimatedCost = inputTokens / 1,000,000 × inputPrice + outputTokens / 1,000,000 × outputPrice`.
- Routed total uses the selected tier; baseline uses the frontier profile for every task.
- Missing prices yield unavailable totals. Provider analysis usage and cost are separate and unavailable unless actually measured and priced.

## Failure modes

- Invalid request: HTTP 400 with a stable error code and readable message.
- Missing provider key: HTTP 503; report configuration guidance in the UI.
- Provider 401/403: HTTP 502 with key configuration guidance.
- Provider 429: HTTP 429 with retry guidance.
- Network error or 25-second timeout: HTTP 502/504 with retry guidance.
- Provider failure, unreadable JSON, invalid structured output, or missing/duplicate decisions: HTTP 502; apply no routes.

## Privacy and limits

The PRD remains in browser state. Live mode transmits reviewed task IDs, titles, and descriptions to the selected provider. The API key stays server-side. There are no accounts, persistent data storage, execution tools, editor model availability checks, or silent fallback.

## Run and manual acceptance

Run `npm ci`, configure `.env.local` from `.env.example`, and use `npm run dev`. Analyze a non-confidential builder PRD in live mode; inspect an override and exported plan. Also check empty/no-task/oversized input, 20-task truncation, missing keys, provider errors, malformed output, and unavailable costs when profiles are empty.

## Sharing

- Public source repository: <https://github.com/aayushyadavji/rung>
- Open-source license URL for the Devpost form: <https://github.com/aayushyadavji/rung/blob/main/LICENSE>
- The repository is on `main`; the four implementation/documentation commits are pushed to `origin/main`.
- The Devpost entry and public demo video are not yet supplied.
