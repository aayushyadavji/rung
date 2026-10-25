# Build With AI: Basics — Submission Readiness

Last checked: October 25, 2026, using the connected Devpost project list, current submission requirements, and latest host announcements.

## Current state

- [x] The local Rung app builds in production mode.
- [x] A live single-task OpenRouter / GPT-4o mini route was verified in the browser. Provider keys remain local and are not recorded here.
- [x] A user tier override was verified in the exported Markdown plan.
- [x] `scope.md`, `prd.md`, and `spec.md` are present in the repository root.
- [x] An MIT `LICENSE` and blank `.env.example` are present. The real `.env` file is ignored.
- [x] The Devpost Learn Skill Pack is installed locally; `skills-lock.json` records its source and hashes. The skill directory is local agent tooling and is excluded from the application source commit.
- [x] Public source repository: [github.com/aayushyadavji/rung](https://github.com/aayushyadavji/rung). The previous source baseline is public; the current icon, analytics, and dependency updates are local changes and still need to be committed and pushed before they appear on the site.
- [x] Public MIT license URL: [LICENSE](https://github.com/aayushyadavji/rung/blob/main/LICENSE). GitHub repository page responds without authentication.
- [x] Public application: [rung-phi-nine.vercel.app](https://rung-phi-nine.vercel.app/). Live landing page checked in Chrome; it renders Rung branding and the complete landing page.
- [x] Rung app icon added at `app/icon.svg` to replace a default framework icon.
- [x] Vercel Web Analytics package wired into the Next.js root layout. **Still required:** enable Analytics in the Vercel project dashboard and deploy this code before collection begins.
- [x] Next.js updated to 15.5.28; PostCSS patched to 8.5.31; `npm audit --omit=dev` reports zero production vulnerabilities.
- [ ] Public demo video URL: not recorded or supplied.
- [ ] A Rung project entry: not found in the connected account's current project list.
- [ ] Devpost submission form: participant still needs to complete the required fields and submit.

## Official event requirements

The current Devpost form marks a public YouTube/Vimeo demo video under 3 minutes as required. A website and ZIP file are not required. The public repository needs an open-source license file and its URL supplied in the form. The latest host announcement says reviewers expect the app to appear early in the video, the opening screen to identify the app and audience, and the video to show the app and how it was built with the Learn Skill Pack. Check the [event page](https://learn-ai-basics.devpost.com/) and form again before submission in case requirements change.

Current submission deadline: **Monday, October 26, 2026 at 5:00 PM ET** (**Tuesday, October 27 at 2:30 AM IST**). The event is still accepting submissions at this check.

The form's required answers are:

- Submission type (individual, team, or organization).
- Country of residence.
- Which event resources the participant actually used.
- Whether AI costs affected the work.
- Current confidence planning/building a small maintainable project with an agent.
- URL to the open-source license in the public repository.
- Value the project created for the participant.
- How the project used the Devpost Learn Skill Pack to plan and build it.
- Age-of-majority and eligibility confirmations.

The form also has optional organization name, suggested improvement, and additional value details. The participant must supply all personal, eligibility, and reflection answers truthfully. This checklist intentionally does not write submission copy or make eligibility declarations for the participant.

## Source publication verification

- Public GitHub page checked without authentication; it returned HTTP 200.
- The pushed `main` hash matched local HEAD; the working tree was clean at verification.
- `.env`, `.env.local`, dependencies/build output, `.agents/`, and local audit snapshots are ignored or excluded. No recognized API-key/token patterns were found in publishable source files.
- `scope.md`, `prd.md`, `spec.md`, and the root MIT license are present in the public repository.
- Add the repository and license URLs to the Devpost project's repository / try-it-out and license fields when creating/updating that entry.

## Before submitting

- Record the working app early in the video, then show one complete workflow: PRD input, task review, live routing, recommendation inspection, optional override, and Markdown export.
- Explain the actual Learn Skill Pack use in the participant's own words. Show the app working; don't show API keys or private PRDs.
- Upload the video to a publicly playable location accepted by the current form and record its URL here: **not supplied**.
- Complete all required form fields and eligibility declarations yourself.
- Submit on Devpost and verify Devpost shows the submission as submitted. No submission is claimed by this repository.

## Useful links

- [Build With AI: Basics](https://learn-ai-basics.devpost.com/)
- [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics)
- [Rung public repository](https://github.com/aayushyadavji/rung)
- [Rung MIT license](https://github.com/aayushyadavji/rung/blob/main/LICENSE)
- [Current Rung demo app](http://localhost:3001/) (local only; reviewers cannot access this URL)
