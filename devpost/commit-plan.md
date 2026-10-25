# Published Commit Series

The following four commits were created locally and pushed to `main` on <https://github.com/aayushyadavji/rung>. GitHub's `main` ref matched local HEAD after push.

## 1. `a75af96` — `feat: add live task routing API`

Include the server route, provider configuration endpoint, routing types and policy, and cost-profile calculation. This commit establishes the validated server-side analysis contract and no-secret browser configuration surface.

Expected paths: `app/api/`, `lib/`, `config/`.

## 2. `4699ee3` — `feat: build the PRD-to-routing dashboard`

Include the landing page, task input/review flow, dashboard sections, override controls, cost view, and Markdown export. Keep the commit focused on user-visible workflow and presentation.

Expected paths: `app/page.tsx`, `app/layout.tsx`, `app/*.css`, `components/`.

## 3. `0f4449f` — `docs: align planning docs with the shipped workflow`

Include the current scope, PRD, and spec, plus technical build notes and the factual Devpost submission-readiness check. The docs should describe OpenRouter priority, NVIDIA fallback, privacy boundaries, actual workflow and remaining submission requirements.

Expected paths: `scope.md`, `prd.md`, `spec.md`, `build-notes.md`, `devpost/`.

## 4. `14d5fcc` — `chore: prepare the project for local setup and release`

Include the README, demo recording outline, MIT license, blank environment template, ignore rules, and package metadata. Keep keys, dependencies, generated build output, and local-only agent tooling out of the public commit.

Expected paths: `README.md`, `demo-script.md`, `LICENSE`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, `next.config.js`, `tsconfig.json`, `next-env.d.ts`, `design.md`, and `skills-lock.json`.

The repository and root MIT license are publicly accessible without authentication. The working tree is clean. No extra commit or force-push is needed for this release state.
