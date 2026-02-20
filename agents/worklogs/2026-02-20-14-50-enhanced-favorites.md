---
when: 2026-02-20T14:50:35Z
why: Store full settings per-station for future use while keeping restore minimal
what: Favorites now store all settings (departures, interval, size, language) but only restore station, stopId, and modes
model: github-copilot/claude-sonnet-4.5
tags: [favorites,settings,ux]
---

Enhanced favorites storage in v1.22.0. Each favorite now stores numDepartures, fetchInterval, textSize, and language alongside station info. On restore, only station name, stopId, and transport modes are applied - preserving user's current global settings. Per-station settings stored for future features. Files: src/ui/station-dropdown.js, src/app.js, src/sw.js, src/config.js
