---
when: 2026-02-14T22:12:00Z
why: avoid JSON module import which triggers MIME errors in some browsers
what: switch browser demo loader to use `fetch` and keep Node `fs` fallback; update code and tests unchanged
model: github-copilot/gpt-5-mini
tags: [bugfix, browser]
---

Switched `getDemoData` to use `fetch` in browser contexts rather than dynamic JSON `import`, preventing the browser console MIME-type error when serving `demo.json` from a static server. Node still reads via `fs` during tests.
