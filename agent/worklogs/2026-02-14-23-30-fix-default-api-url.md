---
when: 2026-02-14T23:30:00Z
why: fix live fetch sending POST to local server due to missing API URL in config
what: add `API_URL` to `src/config.js` so fetchDepartures posts to Entur endpoint instead of the local host; update app to guard when API URL missing
model: github-copilot/gpt-5-mini
tags: [bugfix, entur]
---

Fixed a production bug where `DEFAULTS.API_URL` was missing, causing the browser to POST to the app origin (static server) resulting in 501 from the static server. Added `API_URL` to `src/config.js` and added a guard in `src/app.js` to avoid posting when API URL is absent.
