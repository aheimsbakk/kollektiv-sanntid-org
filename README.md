

# Departure board — pure JavaScript + CSS

This repository is a small, dependency-free departure board implemented with vanilla JavaScript and CSS. It's a one-page app inspired by `departure.sh` and intended for local development, easy testing, and simple static deployment.

## Key features
- No build step or external runtime dependencies — open `index.html` or serve the directory to run the app.
- Shows upcoming departures with transport-mode emojis (parsing logic exercised by tests).
- Simple node-based tests and scripts to validate contributor worklogs.

## Getting started
1. Clone the repo and open the folder.
2. Optional: enable the local git hooks used for strict worklog enforcement:
   - `git config core.hooksPath .githooks`
3. Run in the browser:
   - Open `index.html` directly, or serve the directory for a better dev flow: `npx http-server -c-1 .` or `python -m http.server`.

## Worklogs
- Before making changes, create a concise worklog under `agent/worklogs/YYYY-MM-DD-HH-mm-{desc}.md` using `agent/WORKLOG_TEMPLATE.md`.
- Pre-commit attempts to auto-fix and validate worklogs via `.githooks/pre-commit` (runs `scripts/fix_worklogs.sh` then `scripts/validate_worklogs.sh`).

## Tests
- Run the node test harness: `node node tests/run.mjs`.
- Tests cover GraphQL query shape and parsing for `serviceJourney.journeyPattern.line.transportMode` and related logic.

## Development tips
- CSS knobs: `src/style.css` contains two main spacing controls:
  - `.departures { gap: ... }` — space between station rows
  - `.departure { row-gap: ... }` — space between destination and countdown inside a row
  Inline comments in `src/style.css` point to these lines for quick edits.
- UI modules live in `src/ui` (`options.js`, `departure.js`, `ui.js`, `header.js`).
- Parsing logic is in `src/entur.js`; tests in `tests/` exercise this code.

## Agents
- If you are contributing as an agent (automated or human-following-agent rules), read `AGENT.md` for the agent protocol, required worklog format, and workflow expectations before making edits.

## Committing
- The repo includes a local pre-commit hook at `.githooks/pre-commit`. Enable it locally with `git config core.hooksPath .githooks`.

## Contributing
- Keep worklogs short and use the exact front-matter order: `when`, `why`, `what`, `model`, `tags`.
- Update `agent/CONTEXT.md` if you change validator behavior or templates so other contributors/agents are informed.

## License
- MIT
