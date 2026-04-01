---
when: 2026-03-17T21:23:43Z
why: OSM button broke after reload following a share-link import because LAT/LON were never persisted to localStorage — the URL was cleaned and the station was not in favorites
what: persist and restore LAT/LON in saveSettings()/loadSettings() in settings.js
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, osm-button, settings, share-link, coords]
---

Added `LAT`/`LON` to `saveSettings()` and `loadSettings()` in `src/app/settings.js` with strict WGS 84 bounds validation. Coords now survive reload regardless of whether they came from a share link, GPS selection, or favorites. Updated the fallback comment in `src/app.js`. Version bumped to 1.40.9.
