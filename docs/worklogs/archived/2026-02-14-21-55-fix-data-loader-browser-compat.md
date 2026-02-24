---
when: 2026-02-14T21:55:00Z
why: fix browser SyntaxError caused by `import ... assert` usage in data-loader
what: update `src/data-loader.js` to use dynamic import with fallback to fetch; update app and tests to await demo loader
model: github-copilot/gpt-5-mini
tags: [bugfix, browser, tests]
---

Fixed a browser compatibility issue where `import ... assert { type: 'json' }` produced a SyntaxError in some environments. `src/data-loader.js` now tries a dynamic import with import assertion and falls back to fetching `demo.json`. Updated `src/app.js` and tests to await the async loader.
