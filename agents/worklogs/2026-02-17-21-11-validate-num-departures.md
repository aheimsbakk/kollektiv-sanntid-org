---
when: 2026-02-17T21:11:29Z
why: Number of departures input allowed values below 1 minimum
what: Added validation to enforce 1 minimum on Enter, blur, and Apply
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, validation, ui]
---

Added comprehensive validation for number of departures input in `src/ui/options.js`. Values below 1 are automatically corrected to 1 when Enter is pressed, on blur, or when Apply is clicked. Empty input restores current value. Updated keyboard handler, blur event, and `applyChanges()` function. Bumped version to 1.4.5.
