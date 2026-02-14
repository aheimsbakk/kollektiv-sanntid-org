---
when: 2026-02-14T22:25:00Z
why: implement per-departure live countdown in browser app matching shell logic
what: add per-node countdown update function and tests for HH:MM:SS formatting
model: github-copilot/gpt-5-mini
tags: [feature, ui, tests]
---

Implemented a robust per-departure countdown update in `src/ui/departure.js` and updated `src/app.js` to set epoch metadata and call the updater every second. Added an hours-format test to `tests/time.test.mjs` to validate HH:MM:SS output when hours>0.
