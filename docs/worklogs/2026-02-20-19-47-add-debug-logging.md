---
when: 2026-02-20T19:47:34Z
why: Investigate why autocomplete test passes but browser fails
what: Add debug logging to track autocomplete state transitions
model: github-copilot/claude-sonnet-4.5
tags: [debug, autocomplete, logging]
---

Added console.log statements to `src/ui/options.js` tracking focus handler (entry/exit state), updateFields (before/after), and input handler (all decision points). Logs track: value, stopId, lastQuery, updatingFields flag, selection range, and search results. Version bumped to 1.27.9.
