---
when: 2026-02-28T19:57:02Z
why: Simplify share link encoding and add default favorite import feature
what: Share links now encode only stationName, stopId, transportModes (3 elements). Added DEFAULT_FAVORITE config and automatic import when no favorites exist. Fixed heart button to show disabled state after default import.
model: opencode/big-pickle
tags: [share, favorites, config, ui]
---

Simplified share link encoding in share-button.js to use 3-element array format [name, stopId, modes]. Added backward compatibility for 7-element legacy format. Added DEFAULT_FAVORITE config in config.js that auto-imports when user has no favorites. Fixed station-dropdown.js to import default early in app.js init, and applied favorite to DEFAULTS so heart button shows disabled state correctly. Added tests in favorites.test.mjs.
