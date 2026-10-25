# Scope: Rung

## One-line pitch

Rung helps developers plan which model capability tier to use for each task in a software PRD, while making uncertainty visible and leaving the final route with the builder.

## Problem

AI coding work contains tasks with different levels of complexity, ambiguity, cross-file impact, and reasoning depth. Sending every task to the same model can waste capacity; selecting a cheap model without review can create avoidable failures. Builders need an inspectable plan, not an unexplained tier label.

## Audience

Developers and hackathon builders who use AI coding agents and want to plan model use before asking an agent to change code.

## Unique kernel

Paste a PRD, review a locally extracted task list, receive structured risk-aware routing recommendations, inspect the evidence, override a route, and export a plan for the builder's coding agent.

## In scope

- Markdown paste and `.md` upload, with deterministic extraction capped at 20 tasks.
- Edit, add, and remove tasks before routing.
- Live structured analysis through a configured hosted provider: OpenRouter is preferred when `OPENROUTER_API_KEY` exists; NVIDIA NIM is used when OpenRouter is not configured and `NVIDIA_API_KEY` exists.
- Visible tier, effort, confidence, score breakdown, rationale, and deterministic review flags.
- User tier overrides that preserve the original recommendation.
- Cost estimates only when all tier prices have source URLs and `asOf` dates; otherwise cost is unavailable.
- Markdown plan export, responsive dashboard, clear API errors, and privacy notice.

## Out of scope

Executing coding tasks, autonomous tool use, editor-specific model availability checks, automatic dispatch to a coding agent, accounts, persistent history, guaranteed savings or quality parity, and a required public deployment.

## Product boundaries

Rung recommends a plan and does not execute code. Live analysis sends reviewed task IDs, titles, and descriptions to the configured provider. OpenRouter takes priority when configured; otherwise Rung can use NVIDIA NIM. There is no simulated routing mode. Missing prices or usage remain unavailable rather than being treated as zero.

## Hackathon fit

Build With AI: Basics expects a new working proof of concept built with the Devpost Learn Skill Pack and the generated `scope.md`, `prd.md`, and `spec.md`. This project demonstrates one coherent end-to-end workflow, a differentiated risk-aware recommendation, and visible use of planning before coding. The public repo and demo video need to show the app functioning; the participant must explain their actual use of the Learn Skill Pack in their own Devpost submission.
