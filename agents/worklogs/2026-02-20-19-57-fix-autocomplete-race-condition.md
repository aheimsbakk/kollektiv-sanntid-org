---
when: 2026-02-20T19:57:13Z
why: Fix race condition where old search results overwrite newer queries
what: Validate search results match current input before displaying
model: github-copilot/claude-sonnet-4.5
tags: [bug, autocomplete, race-condition]
---

Fixed autocomplete race condition in `src/ui/options.js`. When user types quickly, multiple debounced searches fire (250ms apart). Slower API responses could arrive after user has typed more, showing wrong results. Added validation to only display results if `inpStation.value === searchQuery`. Enhanced debug logging to show query, results, and stale detection. Version 1.27.10.
