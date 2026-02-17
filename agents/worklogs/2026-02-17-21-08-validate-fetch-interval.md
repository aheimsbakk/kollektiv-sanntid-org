---
when: 2026-02-17T21:08:57Z
why: Fetch interval input allowed values below 20 seconds minimum
what: Added validation to enforce 20s minimum on Enter, blur, and Apply
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, validation, ui]
---

Added comprehensive validation for fetch interval input in `src/ui/options.js`. Values below 20 are automatically corrected to 20 when Enter is pressed, on blur, or when Apply is clicked. Empty input restores current interval value. Updated both keyboard handler and `applyChanges()` function. Bumped version to 1.4.4.
