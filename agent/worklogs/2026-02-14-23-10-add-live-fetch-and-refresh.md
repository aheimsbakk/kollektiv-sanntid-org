---
when: 2026-02-14T23:10:00Z
why: implement live Entur data fetching and automatic refresh in the browser app
what: add stopPlace lookup to `src/entur.js`, update `src/app.js` to fetch live data with retry/fallback to demo and implement periodic refresh; add a unit test for lookup
model: github-copilot/gpt-5-mini
tags: [feature, entur, refresh]
---

Added `lookupStopId` to `src/entur.js` and updated `src/app.js` to try live data on startup, fall back to demo data on failure, and refresh every `FETCH_INTERVAL` seconds. Added a Node-local test for the lookup function.
