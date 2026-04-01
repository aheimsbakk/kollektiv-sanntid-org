---
when: 2026-03-17T21:14:09Z
why: on reload, loadSettings() set STOP_ID before the coord-restore block ran, so the if-guard skipped it and DEFAULTS.LAT/LON stayed null
what: restore GPS coords from favorites unconditionally after station selection, matching on stopId
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, osm-button, startup, coords]
---

Moved the `DEFAULTS.LAT`/`LON` restore in `src/app.js` outside the `!urlImported && !DEFAULTS.STOP_ID` guard. It now runs unconditionally after station selection, finding the matching favorite by `stopId` (falling back to `favorites[0]`). This fixes the case where `loadSettings()` already populated `DEFAULTS.STOP_ID` so the old guard was never entered and coords remained `null`. Version bumped to 1.40.6.
