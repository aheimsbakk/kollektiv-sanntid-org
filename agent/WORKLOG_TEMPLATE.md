Worklog template (create BEFORE making edits)

Purpose
 - Short, discoverable record of intent created before code changes (per AGENT.md).
 - Keep entries concise so reviewers can understand why a change was started.

Required fields (fill these before editing)
 - Title: one-line descriptive title (imperative tone)
 - Date: YYYY-MM-DD
 - Author: your name or initials
 - Created before edit: yes / no

Intent / Summary (1-2 lines)
 - One or two sentences describing the goal of the change.

What will change
 - Bullet list of concrete code/files/behavioural changes you will make.
 - Keep to 3-6 bullets when possible.

Files to be modified
 - List of file paths you expect to edit (one per line).

Why
 - Short rationale (why this change is needed, user story or bug being fixed).

Acceptance criteria / Tests
 - How you will verify the change (unit tests, manual steps, commands to run).

Plan / Steps
 - Short step-by-step plan if the change is non-trivial (3-6 steps).

Notes / Risks
 - Anything reviewers should watch for (schema sensitivity, performance, backwards compatibility).

Follow-up (optional)
 - Next tasks or cleanup you expect after this change.

Status (to be filled later)
 - created / in_progress / completed / archived

Example
-------
Title: Prefer journeyPattern.line.transportMode in GraphQL selection
Date: 2026-02-15
Author: ac
Created before edit: yes

Intent / Summary:
 - Request transport-mode candidate fields from Entur so the UI can render correct emojis.

What will change:
 - Update `src/entur.js` to include `serviceJourney { journeyPattern { line { publicCode transportMode } } }` in extended query
 - Add parsing in `parseEnturResponse` to set `item.mode` from that path
 - Add a unit test for parsing

Files to be modified:
 - src/entur.js
 - src/ui/departure.js
 - tests/entur.parse.mode.test.mjs

Why:
 - Server responses are inconsistent; explicitly requesting this minimal path returns the transport mode without triggering schema validation errors.

Acceptance criteria / Tests:
 - New unit test passes: `./node/node tests/run.mjs`
 - Manual capture for representative stop shows `serviceJourney.journeyPattern.line.transportMode` populated

Plan / Steps:
 1. Add worklog (this file)
 2. Implement minimal extended query and parsing
 3. Add tests and run test suite
 4. Iterate if raw dumps show different field names

Notes / Risks:
 - Entur GraphQL is strict about AST shapes; prefer variable-based variants where appropriate.
