---
when: 2026-02-14T21:10:00Z
why: scaffold UI modules and add Node-local test for Entur fetch wrapper
what: add `src/ui/*` components, `src/icons.css`, update `src/app.js` to use UI, and add `tests/entur.fetch.test.mjs`
model: github-copilot/gpt-5-mini
tags: [scaffold, ui, tests]
---

Scaffolded UI primitives (`src/ui/ui.js`, `src/ui/departure.js`, `src/ui/header.js`) and `src/icons.css`; updated `src/app.js` to wire UI to demo data and added `tests/entur.fetch.test.mjs` to validate `fetchDepartures` using a mock fetch function. No commits; files added to working tree.
