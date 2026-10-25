# Proposed Commit Series

These are proposed local commit boundaries for when the project GitHub repository is supplied. No commits or pushes have been made. The public submission requires a public repository, so review staged file contents and secret exclusions again before pushing.

## 1. `feat: add live task routing API`

Include the server route, provider configuration endpoint, routing types and policy, and cost-profile calculation. This commit establishes the validated server-side analysis contract and no-secret browser configuration surface.

Expected paths: `app/api/`, `lib/`, `config/`.

## 2. `feat: build the PRD-to-routing dashboard`

Include the landing page, task input/review flow, dashboard sections, override controls, cost view, and Markdown export. Keep the commit focused on user-visible workflow and presentation.

Expected paths: `app/page.tsx`, `app/layout.tsx`, `app/*.css`, `components/`.

## 3. `docs: align planning docs with the shipped workflow`

Include the current scope, PRD, and spec, plus technical build notes and the factual Devpost submission-readiness check. The docs should describe OpenRouter priority, NVIDIA fallback, privacy boundaries, actual workflow and remaining submission requirements.

Expected paths: `scope.md`, `prd.md`, `spec.md`, `build-notes.md`, `devpost/`.

## 4. `chore: prepare the project for local setup and release`

Include the README, demo recording outline, MIT license, blank environment template, ignore rules, and package metadata. Keep keys, dependencies, generated build output, and local-only agent tooling out of the public commit.

Expected paths: `README.md`, `demo-script.md`, `LICENSE`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, `next.config.js`, `tsconfig.json`, `next-env.d.ts`, `design.md`, and `skills-lock.json`.

Before creating these commits, review the actual diff and adjust the grouping if files have changed. After the user provides the repository URL and authorizes publication, verify the remote, create the commits, push the intended branch, then verify the public repository and license URL.
