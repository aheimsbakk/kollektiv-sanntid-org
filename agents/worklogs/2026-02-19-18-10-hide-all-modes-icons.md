---
when: 2026-02-19T18:10:40Z
why: Clean dropdown display when all transport modes are selected
what: Hide mode icons in dropdown when all modes are selected (default)
model: github-copilot/claude-sonnet-4.5
tags: [fix, ui, ux, station-dropdown]
---

Updated getModesDisplay() to return empty string when all transport modes are selected. This represents the default/unfiltered state more clearly - showing no icons is cleaner than showing all six icons. Only partial mode selections now display icons in the dropdown. Version bumped to 1.12.3.

**Files modified:** src/ui/station-dropdown.js, src/config.js, src/sw.js
