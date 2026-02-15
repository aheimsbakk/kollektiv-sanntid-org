Outstanding TODOs

1) High: add UI test for emoji rendering
   - Description: Add a unit/UI test that mounts a departure node with `mode` set to canonical values and asserts the emoji shown matches mapping (bus, tram, metro, rail, water, coach).
   - Why: Verifies end-to-end UI mapping so future parser changes don't regress emoji display.
   - How to verify: `./node/node tests/run.mjs` (or add a dedicated test under `tests/ui.*.mjs`).
   - Status: pending

2) High: conservative fallback mapping when server omits mode
   - Description: Implement and test a small, maintainable heuristic that infers mode from `line.publicCode` and/or `destinationDisplay.frontText` for cases where `serviceJourney` is absent.
   - Why: Some stops/responses do not include serviceJourney; this improves UX without server changes.
   - Status: pending

3) Medium: refine fetch selection after further raw dumps
   - Description: Use the Debug UI or a raw-dump of representative stops to confirm which fields are available and, if needed, add minimal additional fields to `fetchDepartures` (without triggering schema validation errors).
   - Why: Ensures parser reads canonical server-provided fields instead of relying on heuristics.
   - How to run raw dump: set `window.__ENTUR_DEBUG_PANEL__ = fn` in browser console (opt-in) or use the app Debug UI before it was removed.
   - Status: pending

4) Medium: accessibility & keyboard tests for Options panel
   - Description: Add tests that the options panel traps focus, ESC closes, and labels are associated with inputs.
   - Why: Ensure accessibility guarantees remain stable across future changes.
   - Status: pending

5) Low: add hover/focus styling for compact mode checkboxes
   - Description: Improve discoverability of compact checkbox chips (subtle background on hover/focus, visible focus outline).
   - Status: pending

6) Low: tidy worklogs and archive resolved entries
   - Description: Move older worklogs to an `agent/worklogs/archived/` folder or add a short index summarizing them.
   - Why: Keeps active worklogs focused and `agent/CONTEXT.md` concise.
   - Status: pending

7) Low: draft PR body and changelog for review
   - Description: Prepare a PR description summarizing the changes, tests added, and recommended follow-ups.
   - How to verify: Create PR from current branch; include commit list shown by `git log --oneline HEAD~3..HEAD`.
   - Status: pending

Work instructions
- Run tests: `./node/node tests/run.mjs`
- Run a quick local UI dev server (if available) and inspect: open `index.html` or run `npm start` if the repo provides it.
- To capture server fields for a particular stop from the CLI (example):
  - geocode: `curl -H 'ET-Client-Name: personal-js-app' "https://api.entur.io/geocoder/v1/autocomplete?text=Jernbanetorget&lang=no"
  - graphql raw query: POST to `https://api.entur.io/journey-planner/v3/graphql` with `query: query { stopPlace(id: "<STOP_ID>") { estimatedCalls(numberOfDepartures: 10) { expectedDepartureTime destinationDisplay { frontText } serviceJourney { journeyPattern { line { publicCode transportMode } } } } } }`

Notes
- Prefer minimal GraphQL selections (we already request `serviceJourney.journeyPattern.line{publicCode,transportMode}`) — larger selections cause validation errors on some endpoints.
- Keep debug hooks opt-in (`window.__ENTUR_DEBUG_PANEL__`) rather than embedding UI by default.
