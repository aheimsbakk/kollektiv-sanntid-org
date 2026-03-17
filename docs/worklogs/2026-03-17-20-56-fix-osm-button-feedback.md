---
when: 2026-03-17T20:56:36Z
why: OSM button gave no user feedback when coordinates were missing and leaked stale coords on re-type
what: Show osmNoCoords toast on missing coords; clear stale lat/lon on autocomplete re-type; pass LAT/LON through validateOptions
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, osm, ux, toast, coordinates, options-panel]
---

Three fixes: (1) `osm-button.js` now calls `showOsmToast(t('osmNoCoords'))` instead of silently returning when no coordinates are available — a self-dismissing `#osm-toast` body element auto-hides after 3 s, styled in `toasts.css`; (2) `station-autocomplete.js` clears `dataset.lat`/`dataset.lon` alongside `dataset.stopId` on every input event to prevent stale coordinates persisting across searches; (3) `settings-store.js` `validateOptions()` now passes `LAT`/`LON` through so they survive the validation step and reach `onApplySettings`. Version bumped 1.40.1 → 1.40.2.
