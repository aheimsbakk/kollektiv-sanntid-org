---
when: 2026-02-19T18:18:18Z
why: Prevent confusion when selecting a new station from autocomplete
what: Auto-check all transport modes when new station selected
model: github-copilot/claude-sonnet-4.5
tags: [fix, ui, ux, options-panel, autocomplete]
---

Updated selectCandidateIndex() to automatically check all transport mode checkboxes when a user selects a new station from the autocomplete list. This prevents confusion where a user might select a new station but see filtered results from previously unchecked modes. Fresh station = fresh start with all modes enabled. Version bumped to 1.12.4.

**Files modified:** src/ui/options.js, src/config.js, src/sw.js
