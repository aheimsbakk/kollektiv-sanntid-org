---
when: 2026-03-17T20:50:08Z
why: lat/lon were never propagated when a station was selected via the options panel autocomplete
what: Fix coordinate chain for options panel station search so OSM button works after manual station change
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, osm, geocoder, options-panel, coordinates]
---

Fixed a broken coordinate chain across four files: `searchStations()` in `geocoder.js` now extracts `lat`/`lon` from GeoJSON feature geometry; `station-autocomplete.js` stores them in `inpStation.dataset` on selection and exposes `getLat()`/`getLon()` in its public API; `options/index.js` `applyChanges()` reads those getters and includes `LAT`/`LON` in the payload passed to `onApply`; `handlers.js` `onApplySettings()` writes `newOpts.LAT`/`newOpts.LON` into `DEFAULTS`. Version bumped 1.40.0 → 1.40.1.
