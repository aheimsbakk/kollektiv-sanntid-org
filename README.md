# Departure board — pure JavaScript + CSS

This repository is a small, dependency-free departure board implemented with vanilla JavaScript and CSS. It's a one-page app inspired by `departure.sh` and intended for local development, easy testing, and simple static deployment.

## Key features
- No build step or external runtime dependencies — open `index.html` or serve the directory to run the app.
- Shows upcoming departures with transport-mode emojis (parsing logic exercised by tests).
- Simple node-based tests and scripts.

## Getting started
1. Clone the repo and open the folder.
2. Run in the browser:
   - Open `src/index.html` directly, or serve the `src` directory for a better dev flow: `npx http-server -c-1 src` or `python -m http.server -d src`.

## Tests
- Run the node test harness: `node tests/run.mjs`.
- Tests cover GraphQL query shape and parsing for `serviceJourney.journeyPattern.line.transportMode` and related logic.

## Development tips
- CSS knobs: `src/style.css` contains two main spacing controls:
  - `.departures { gap: ... }` — space between station rows
  - `.departure { row-gap: ... }` — space between destination and countdown inside a row
  Inline comments in `src/style.css` point to these lines for quick edits.
- UI modules live in `src/ui` (`options.js`, `departure.js`, `ui.js`, `header.js`).
- Parsing logic is in `src/entur.js`; tests in `tests/` exercise this code.

## Committing
- This project uses local pre-commit hooks at `.githooks/pre-commit` for code quality and worklog validation. You can enable them locally with:
  - `git config core.hooksPath .githooks`.

## Contributing
- Contributions are welcome! Please document your changes concisely in a worklog file under `agents/worklogs/YYYY-MM-DD-HH-mm-{desc}.md` using the provided `agents/WORKLOG_TEMPLATE.md`.
- Ensure all tests pass (`node tests/run.mjs`).

## License
- MIT
