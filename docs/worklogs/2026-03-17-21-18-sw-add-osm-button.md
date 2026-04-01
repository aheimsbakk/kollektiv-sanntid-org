---
when: 2026-03-17T21:18:55Z
why: osm-button.js was added this session but never registered in the service worker ASSETS list
what: add ./ui/osm-button.js to sw.js ASSETS cache list
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, sw, pwa, osm-button]
---

Added `./ui/osm-button.js` to the `ASSETS` array in `src/sw.js`. Verified all other source files (JS, CSS, HTML, SVG, webmanifest) are present; only `sw.js` itself is intentionally absent. Version bumped to 1.40.8.
