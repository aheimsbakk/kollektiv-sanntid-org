---
when: 2026-04-23T16:42:34Z
why: GPS coordinates were silently nulled out on any settings change and on keyboard-Enter station selection, breaking the OSM map button
what: fix three code paths that discarded DEFAULTS.LAT/LON unintentionally
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, gps, osm, options-panel, station-dropdown]
---

Added `_explicitSelection` flag to `station-autocomplete.js` so `applyChanges()` in `options/index.js` only reads `getLat()/getLon()` when the user actually picked a new station from the autocomplete list, falling back to `defaults.LAT/LON` otherwise — this prevented mode-filter, N-departures, interval, and text-size changes from nulling coordinates. Fixed keyboard-Enter selection in `station-dropdown.js` by storing `lat`/`lon` in each menu item's `dataset` during `populateMenu()` and reading them back in the `handleKeyDown` Enter branch; if a favourite has no coordinates the result is correctly `undefined` → `null`. Bumped to v1.40.24.
