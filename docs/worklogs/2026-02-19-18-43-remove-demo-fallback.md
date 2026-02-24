---
when: 2026-02-19T18:43:14Z
why: Remove demo data fallback to always show live data or empty state
what: Remove all demo data fallback logic and getDemoData imports
model: github-copilot/claude-sonnet-4.5
tags: [refactor,demo,live-data,cleanup]
---

Removed all demo data fallback logic from app. Now exclusively fetches live data from Entur API or displays empty state "No departures..." when no results. Removed getDemoData import, removed fallbackToDemo parameter from doRefresh(), removed data-loader.js and demo.json from service worker cache. Changed error status from "Demo" to "Error" when fetch fails. Version bumped to 1.14.0. Files: src/app.js, src/sw.js, src/config.js.
