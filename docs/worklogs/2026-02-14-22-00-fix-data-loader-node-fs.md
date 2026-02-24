---
when: 2026-02-14T22:00:00Z
why: ensure demo.json loads under Node during tests
what: update `src/data-loader.js` to read demo.json via fs when running in Node to avoid fetch/file:// issues
model: github-copilot/gpt-5-mini
tags: [bugfix, node, tests]
---

Fixed Node test failure by adding a Node-specific path in `getDemoData` that reads `demo.json` with `fs/promises`. This prevents falling back to `fetch` against a file:// URL which is not implemented in Node's fetch.
