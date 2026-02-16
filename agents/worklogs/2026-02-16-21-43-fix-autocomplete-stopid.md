---
when: 2026-02-16T21:43:40Z
why: Fix autocomplete selection not fetching departures due to label/name mismatch
what: Store and use stopId directly from autocomplete instead of re-looking up label
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, geocoder]
---

Fixed issue where selecting "Blindern, Oslo" from autocomplete failed to fetch departures. The problem: autocomplete returns label "Blindern, Oslo" but looking up that exact text in geocoder returns no results. Solution: Added STOP_ID field to config, store stopId from autocomplete selection, and use it directly in app.js instead of re-looking up the station name. Added comprehensive test demonstrating the issue and fix. Files: src/config.js, src/ui/options.js, src/app.js, tests/entur.autocomplete.blindern.test.mjs.
