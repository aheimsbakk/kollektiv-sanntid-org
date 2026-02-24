---
when: 2026-02-20T20:00:37Z
why: Debug why API returns wrong station for all queries
what: Add logging to searchStations to track API calls and responses
model: github-copilot/claude-sonnet-4.5
tags: [debug, api, entur]
---

Added debug logging to `src/entur.js` searchStations function to track: API URL being called, number of features returned by Entur API, number of transport stops after filtering, and final results with titles. This will reveal whether the API is returning wrong data or if our filtering/processing is broken. Version 1.27.11.
