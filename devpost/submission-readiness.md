# Build With AI: Basics — Submission Readiness

Last checked: October 25, 2026, using the connected Devpost project list and current submission requirements.

## Current state

- [x] The local Rung app builds in production mode.
- [x] A live single-task OpenRouter / GPT-4o mini route was verified in the browser. Provider keys remain local and are not recorded here.
- [x] A user tier override was verified in the exported Markdown plan.
- [x] `scope.md`, `prd.md`, and `spec.md` are present in the repository root.
- [x] An MIT `LICENSE` and blank `.env.example` are present. The real `.env` file is ignored.
- [x] The Devpost Learn Skill Pack is installed locally; `skills-lock.json` records its source and hashes. The skill directory is local agent tooling and is excluded from the application source commit.
- [ ] Public source repository URL: not configured; local Git has no remote or commits yet.
- [ ] Public demo video URL: not recorded or supplied.
- [ ] A Rung project entry: not found in the connected account's current project list.
- [ ] Devpost submission form: participant still needs to complete the required fields and submit.

## Official event requirements

The current Devpost form marks a demo video as required. A website and ZIP file are not required. The public repository needs an open-source license file and its URL supplied in the form. Check the [event page](https://learn-ai-basics.devpost.com/) and form again before submission in case requirements change.

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

## Before publishing the source

- Add the public repository URL here and to the Devpost project's repository / try-it-out field.
- Confirm the repository is public and that GitHub detects the `LICENSE` at the repository root.
- Confirm `.env`, `.env.local`, build output, dependencies, and local audit artifacts are excluded. Never commit API keys.
- Keep `scope.md`, `prd.md`, and `spec.md` in the public repository and make sure they describe the implementation.

## Before submitting

- Record the working app early in the video, then show one complete workflow: PRD input, task review, live routing, recommendation inspection, optional override, and Markdown export.
- Explain the actual Learn Skill Pack use in the participant's own words. Show the app working; don't show API keys or private PRDs.
- Upload the video to a publicly playable location accepted by the current form and record its URL here: **not supplied**.
- Complete all required form fields and eligibility declarations yourself.
- Submit on Devpost and verify Devpost shows the submission as submitted. No submission is claimed by this repository.

## Useful links

- [Build With AI: Basics](https://learn-ai-basics.devpost.com/)
- [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics)
- [Current Rung demo app](http://localhost:3001/) (local only; reviewers cannot access this URL)
