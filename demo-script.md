# Rung — Demo Recording Outline

The Devpost form requires a video but does not state a duration limit in its current requirements. Keep it concise, check the live form before uploading, and make the link publicly playable. Show the app at the start. Record actual behavior; do not read or display keys, private PRDs, invented metrics, or unverified price claims.

## 0:00–0:20 — Who it helps

Show the landing page. Explain that Rung helps developers using coding agents choose a capability tier for each task in a PRD, while keeping uncertainty and user control visible.

## 0:20–0:45 — Review before analysis

Open a prepared, non-confidential Markdown PRD. Show the locally extracted tasks. Edit one task and remove one irrelevant candidate. Point out that task text is not sent to the configured provider until live routing is chosen.

## 0:45–1:25 — Route tasks

Run live analysis and show the actual provider and model identifier reported by the app. Inspect a task's scores and rationale; if a human-review flag appears, explain that it does not change the recommended tier. If the provider is unavailable, do not substitute fabricated output.

## 1:25–1:55 — Human control

Override one tier. Show that the board identifies the override and retains the original recommendation. State that a review flag never changes a route on its own.

## 1:55–2:20 — Transparency and handoff

Open cost assumptions to show that prices are unavailable until sources are configured. Export `routing-plan.md` and point out the mode, model, recommendations, scores, flags, and selected tiers.

## 2:20–2:30 — Build process

In the builder's own words, explain how the Devpost Learn Skill Pack and its `scope.md`, `prd.md`, and `spec.md` planning steps were actually used. Keep the explanation specific to work that was done.
