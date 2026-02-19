---
when: 2026-02-19T17:53:11Z
why: Enable saving transport type filters per station
what: Save transport modes with station favorites in dropdown
model: github-copilot/claude-sonnet-4.5
tags: [feature, ui, station-dropdown, transport-modes]
---

Implemented saving transport modes with each station in the recent stations dropdown. Each combination of station + transport modes is now a separate entry (e.g., "Oslo S 🚆🚌" and "Oslo S 🚇" are distinct favorites). When selecting from dropdown, both station and its saved transport modes are loaded. Icons display inline after station name in consistent order matching the options panel table. Updated version to 1.12.0.

**Files modified:** src/ui/station-dropdown.js, src/app.js, src/config.js, src/sw.js
