# Rung

**Climb only as high as the task needs.**

Rung turns a Markdown product requirements document into an editable task list, requests a capability-tier recommendation for each reviewed task, and exports a routing plan. Builders can inspect the recommendation evidence and override any tier. Rung is a planning assistant: it does not write or execute code.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm ci
```

Create a local environment file from the template and add a server-side provider key:

```powershell
Copy-Item .env.example .env.local
```

Then run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Paste or upload a Markdown PRD, review the extracted tasks, then choose **Analyze with AI**.

## Vercel deployment and analytics

The app includes Vercel Web Analytics through `@vercel/analytics`. In the Vercel project, open **Analytics** and enable Web Analytics, then deploy this version. Vercel starts collecting page views after that deployment. No analytics environment variable or user account is required. The app does not send PRD/task contents as analytics events. The Rung SVG app icon is in `app/icon.svg`.

### Provider configuration

Rung selects the provider on the server. If `OPENROUTER_API_KEY` is set, it uses OpenRouter and defaults to `openai/gpt-4o-mini`. Otherwise, if `NVIDIA_API_KEY` is set, it uses NVIDIA NIM and defaults to `nvidia/nemotron-3.5-super-vl-120b-a12b`. Set `OPENROUTER_MODEL_ID` or `NVIDIA_MODEL_ID` to change that provider's model. When both keys are configured, OpenRouter has priority. Restart the server after changing environment variables.

Never use `NEXT_PUBLIC_` names for credentials or commit `.env` / `.env.local`. The checked-in `.env.example` contains no credentials. The API key stays on the server and is not returned to the browser.

## Product workflow

1. Paste or upload Markdown. Deterministic task extraction runs in the browser and supports up to 20 candidates.
2. Edit, add, and remove tasks before sending anything for analysis.
3. Choose Live analysis. Only reviewed task IDs, titles, and descriptions are sent to the configured provider.
4. Inspect each tier, effort, confidence, four scores, rationale, and human-review flag.
5. Override a tier if needed. Rung preserves the original recommendation and labels the override in the export.
6. Export the routing plan as Markdown.

Provider output is requested as JSON Schema and validated again by the server. Missing credentials, authentication errors, rate limits, timeouts, provider errors, and malformed decisions return an error; Rung does not substitute demo or fabricated routes. The response budget is bounded, so a provider may still fail to return a complete valid plan.

## Dashboard sections

- **Home:** project overview and entry point.
- **New Plan:** PRD input and editable task review.
- **Task Review:** inspect recommendations and override tiers.
- **History:** run summaries in the current browser session only.
- **Cost & Assumptions:** modeled cost is unavailable until verified prices are configured.
- **Settings:** server-side provider and model status; it does not reveal credentials.
- **Export Plan:** copy or download the current Markdown plan.

## Costs and limits

Downstream model cost is unavailable unless all three routing tiers have finite input/output prices, source URLs, and `asOf` dates in `config/model-profiles.ts`. The visible planning assumption is 1,000 input and 500 output tokens per task. Any configured amounts are modeled estimates, not measured provider usage, guaranteed savings, or proof of equal quality. Missing prices are never treated as zero.

Rung recommends abstract `light`, `standard`, or `frontier` capability tiers. It does not query model availability inside Claude Code, Codex, Antigravity, or another editor; verify editor subscriptions; dispatch work to a coding agent; guarantee task quality; or promise savings.

## Project layout

```text
app/                       Next.js pages, styles, and server API routes
components/                Landing page and dashboard sections
config/model-profiles.ts   Optional sourced downstream price profiles
lib/                       Markdown parser, cost model, policy, and types
scope.md                   Project scope
prd.md                     Product requirements
spec.md                    Technical specification
build-notes.md             Implementation decisions and current readiness
demo-script.md             Recording outline (not submission copy)
devpost/                   Submission-readiness checklist and commit plan
skills-lock.json           Installed Learn Skill Pack version/hash record
LICENSE                    MIT License
```

## Build and verify

```bash
npm run build
npm run start -- -p 3001
```

The server exposes `POST /api/route-tasks` for live routing and `GET /api/workspace-config` for non-secret provider status. The second endpoint reports only the provider, model, and whether a server credential is configured; it never validates or returns the credential itself.

Vercel's Analytics package is installed in the root layout. Collection depends on enabling Analytics in the Vercel project settings and deploying the updated app.

## Build With AI: Basics

Rung was developed with the [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics). The required planning documents are [`scope.md`](scope.md), [`prd.md`](prd.md), and [`spec.md`](spec.md). Devpost's current form requires a public repository with an open-source license and a public demo video; a website and ZIP upload are not required. It also has required questions about the Skill Pack, project value, and eligibility that the participant must answer truthfully in Devpost.

The current form also asks for the submitting country and type, which event resources were actually used, whether AI cost changed the work, confidence gained, a suggested improvement, the license URL, and what value the project provided. Some questions are optional. The participant must supply their own factual and reflective answers; this README is project documentation, not submission copy. Judges score Design, Innovation/Idea, and Presentation. The license must be visible in the public repository and linked from Devpost.

As of **October 25, 2026**, submissions for [Build With AI: Basics](https://learn-ai-basics.devpost.com/) close **October 26, 2026 at 5:00 PM ET** (**October 27 at 2:30 AM IST**). Check the event page and submission form for current requirements.

## Privacy

- PRD text remains in browser memory and is not sent until the builder starts Live analysis.
- Live analysis sends only the reviewed task IDs, titles, and descriptions to the configured provider.
- Provider keys remain server-side and are not included in browser responses or exported plans.
- Rung has no account system, database, or PRD persistence.
- Provider availability, pricing, rate limits, and service terms may change; verify them with the provider before changing configuration.
