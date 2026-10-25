# Rung interface design

## Product posture

Rung is a planning workspace for developers who use AI coding agents. Its central job is to turn a reviewed Markdown requirements document into a transparent, human-editable task routing plan. The interface should make the handoff to NVIDIA explicit, keep each recommendation explainable, and make user overrides durable in the export.

## Visual system

- **Character:** precise, calm, and technical. Use a light paper surface, dark ink, restrained indigo action color, and distinct green, blue, and violet tier colors.
- **Typography:** system sans for interface content and system monospace for identifiers, counters, and structured plan text. Keep headings compact and readable.
- **Composition:** the landing page explains the audience and workflow; the dashboard uses a persistent navigation rail and dense task workspace. Avoid decorative mock product screenshots and fictional metrics.
- **Components:** prefer open sections and ruled rows over nested cards. Use one clear primary action per workflow step. Keep controls at least 40px high and navigation hit areas comfortable on touch screens.
- **Accessibility:** visible focus, semantic headings and navigation, descriptive control names, reduced-motion support, keyboard-operable routes, and tier labels in text as well as color.

## Page map

| URL | Purpose | Important state |
| --- | --- | --- |
| `/` | Public explanation and entry point | Start a new plan |
| `/?view=home` | Session overview | Empty state or current real plan summary |
| `/?view=new-plan` | PRD input, local parsing, editable tasks, analysis, routing board | Input, review, loading, error, live result |
| `/?view=review` | Inspect and override a task route | Empty state or selected task |
| `/?view=cost` | Explain downstream cost assumptions | Unavailable until sourced profiles exist |
| `/?view=export` | Copy or download the current plan | Live model metadata and override history |

## Data and honesty rules

- No demo fixtures, seeded counts, simulated provider output, or assumed savings are presented as live data.
- The browser parses the PRD locally. Only reviewed task titles and descriptions are sent to NVIDIA when the user starts live analysis.
- NVIDIA recommendations and Rung's deterministic review flags are separate. A flag requests human review; only an explicit user action changes the selected tier.
- Costs remain unavailable unless model profiles include sourced prices and disclosed token assumptions.
- The current app session is not persisted. Refreshing clears project data.

## Current scope boundary

Rung recommends capability tiers; it does not choose a specific execution provider per task, dispatch to coding agents, execute tasks, persist project history, or claim that different model tiers have equal quality.
