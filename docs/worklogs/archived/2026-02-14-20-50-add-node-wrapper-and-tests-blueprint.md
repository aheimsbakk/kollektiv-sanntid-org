---
when: 2026-02-14T20:50:00Z
why: add a Node wrapper script and expand blueprint with Node-local tests guidance
what: add `node/node` wrapper and update BLUEPRINT.md to document Node ESM tests
model: github-copilot/gpt-5-mini
tags: [setup, tests, blueprint]
---

Added a minimal `node/node` wrapper to run the repository's nvm-installed Node v24.13.1 and updated `BLUEPRINT.md` to recommend ESM Node-local unit tests under `tests/` using Node's built-in `assert` and a small `tests/run.mjs` runner.
