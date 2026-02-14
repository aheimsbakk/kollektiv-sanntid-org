---
when: 2026-02-14T22:10:00Z
why: avoid JSON module import to prevent MIME/type module load errors in some browsers
what: update `src/data-loader.js` to use `fetch` in browsers (avoid import assertions) and keep fs read in Node
model: github-copilot/gpt-5-mini
tags: [bugfix, browser]
---

Some browsers/environments block dynamic JSON module imports due to MIME-type or import-assertion differences. `getDemoData` now uses `fetch` in browser contexts and `fs` in Node contexts to reliably load `demo.json`.
