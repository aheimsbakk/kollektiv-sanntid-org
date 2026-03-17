---
when: 2026-03-17T20:42:15Z
why: Allow users to open the current stop/station on OpenStreetMap directly from the GPS bar
what: Add OSM map button to GPS bar with coordinate propagation through favorites and share URLs
model: github-copilot/claude-sonnet-4.6
tags: [feature, osm, gps, favorites, share, i18n]
---

Added a new 🗺️ OSM button (`src/ui/osm-button.js`) to the GPS bar that opens OpenStreetMap (Transport layer, zoom=16, with pin marker) for the current station's coordinates. GPS coordinates (`lat`/`lon`) are now stored in favorites via `addRecentStation()`, propagated through share URLs as a 5-element encoded array (backward-compatible with old 3-element format), and restored on app startup from the first favorite. Translations added for all 12 languages (`osmTooltip`, `osmNoCoords`). Version bumped 1.39.2 → 1.40.0. Files touched: `src/config.js`, `src/i18n/translations.js`, `src/ui/station-dropdown.js`, `src/entur/gps-search.js`, `src/ui/gps-dropdown.js`, `src/ui/share-button.js`, `src/app/gps-bar.js`, `src/app/handlers.js`, `src/app/action-bar.js`, `src/app/url-import.js`, `src/app.js`, plus new `src/ui/osm-button.js` and 3 new test files.
