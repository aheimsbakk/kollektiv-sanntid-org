---
when: 2026-02-19T18:56:24Z
why: Show transport mode icons in station title when filtering is active
what: Update station title to display mode icons using same rules as dropdown
model: github-copilot/claude-sonnet-4.5
tags: [ui,station-title,transport-modes,icons]
---

Modified station title display to show transport mode icons when user has filtered modes (not all 6 modes selected). Uses same getModesDisplay() logic as dropdown - shows icons inline after station name when partial selection, hides icons when all modes selected. Updated updateTitle() to accept modes parameter and modified all call sites to pass current TRANSPORT_MODES. Version bumped to 1.14.2. Files: src/ui/station-dropdown.js, src/app.js, src/config.js, src/sw.js.
