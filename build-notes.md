# Rung — Build Notes

## Decisions

- The app recommends tiers; it does not execute coding tasks.
- PRD task extraction stays local and deterministic; builders review/edit before routing.
- OpenRouter is preferred when `OPENROUTER_API_KEY` is configured; NVIDIA NIM remains a server-side fallback.
- Provider API keys are read only by the server route, never returned to the browser, and never logged.
- Requests use a compact task-only payload and a bounded output-token budget to control spend. OpenRouter defaults to `openai/gpt-4o-mini`; set `OPENROUTER_MODEL_ID` to override it.
- Live output is JSON-schema constrained and runtime validated, including exact task coverage.
- The app has no simulated routing path; provider failures remain visible and never produce fabricated routes.
- Vercel Web Analytics is integrated in the root layout. Collection still requires enabling Analytics in the Vercel project dashboard and deploying this version. A Rung SVG app icon replaces the default browser icon.
- Review flags are deterministic policy output, separate from the model's tier recommendation.
- User overrides preserve the original tier.
- Downstream costs are unavailable until all tier prices have current sources and dates. Token assumptions remain visible.
- No accounts, database, task execution, or PRD persistence.

## Current configuration

- OpenRouter preferred model: `openai/gpt-4o-mini`; override with server-only `OPENROUTER_MODEL_ID` after checking current OpenRouter pricing and availability.
- NVIDIA fallback model: `nvidia/nemotron-3.5-super-vl-120b-a12b`; override with `NVIDIA_MODEL_ID` after checking current NVIDIA API Catalog availability.
- Cost profiles intentionally start empty in `config/model-profiles.ts`.
- Framework: Next.js 15.5.28. The vulnerable, unsupported Next.js 14 dependency was upgraded after npm reported critical/high advisories. A PostCSS override to `^8.5.31` clears the remaining production advisory.

## Submission readiness still requiring human action

- The public source repository and MIT license are available at `https://github.com/aayushyadavji/rung`; add both repository and license URLs to the Devpost project.
- Record and publicly host a demo video showing the working app and the builder's actual use of the Learn Skill Pack. The Devpost form requires a video; check the form for any duration or format limits.
- Complete every required Devpost field truthfully, including the Skill Pack explanation and age/eligibility checkboxes. The participant writes their own project description and survey answers.
- Add the public repository and video links to the Devpost project. Do not claim a submission was made until Devpost confirms it.

## Current verification

- Production build succeeds with `npm run build` on Next.js 15.5.28.
- `npm audit --omit=dev` reports zero production vulnerabilities after the framework/PostCSS updates.
- The OpenRouter key passed an authenticated models-endpoint check without task data, and the app completed one live GPT-4o mini routing request. No credential value is recorded here.
- The one-task workflow produced a valid live route; a manual tier override was preserved in the Markdown export.
- Cost remains unavailable because verified price profiles are not configured.
