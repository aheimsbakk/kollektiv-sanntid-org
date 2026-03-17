---
when: 2026-03-17T21:30:02Z
why: coord-restore guard used falsy check (!DEFAULTS.LAT) which treats 0 as absent — 0 is a valid WGS 84 coordinate
what: fix coord-restore guard to use strict null check (=== null) in app.js
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, race-condition, coords, osm-button]
---

Changed `!DEFAULTS.LAT && !DEFAULTS.LON` to `DEFAULTS.LAT === null && DEFAULTS.LON === null` in the startup coord-restore fallback in `src/app.js`. The falsy check incorrectly treated coordinate value `0` (equator / prime meridian) as absent, causing valid coords to be overwritten by the favorites fallback. Full race-condition analysis confirmed all other coord guards use `typeof x === 'number'` or `!= null` — no further issues found. Version bumped to 1.40.10.
