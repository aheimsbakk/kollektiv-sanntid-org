---
when: 2026-04-23T16:49:21Z
why: DEFAULT_FAVORITE encodes lat/lon but they were never applied to DEFAULTS on first load, leaving the OSM map button disabled for new users
what: fix getDefaultStation() and app.js to propagate lat/lon from the decoded DEFAULT_FAVORITE
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, gps, osm, default-favorite]
---

`getDefaultStation()` in `station-dropdown.js` now includes `lat`/`lon` from the decoded share-URL object. `app.js` applies those coordinates to `DEFAULTS.LAT`/`LON` alongside `name`, `stopId`, and `modes` when the default station is used as the startup station. Bumped to v1.40.25.
