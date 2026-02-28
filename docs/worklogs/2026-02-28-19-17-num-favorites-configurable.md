---
when: 2026-02-28T19:17:09Z
why: Add configurability for favorites limit and fix dropdown hover styling inconsistency
what: Made NUM_FAVORITES configurable in config.js; fixed CSS specificity conflict in station dropdown hover styling to match autocomplete
model: opencode/big-pickle
tags: [config, ui, css, fix]
---

Added `NUM_FAVORITES` to DEFAULTS in config.js (default 10). Updated station-dropdown.js to use config instead of hardcoded MAX_RECENT. Fixed CSS specificity issue in header.css by adding `:not(:disabled)` to `.station-dropdown-item:hover` selector, ensuring it matches the global `button:hover:not(:disabled)` rule and displays correct highlight colors on hover.
