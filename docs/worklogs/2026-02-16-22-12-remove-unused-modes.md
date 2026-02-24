---
when: 2026-02-16T22:12:30Z
why: Remove air, gondola, funicular modes not used by JourneyPlanner API
what: Remove air, gondola, funicular from config, UI options, and detection logic
model: github-copilot/claude-sonnet-4.5
tags: [transport-modes, config, ui, cleanup]
---

Removed air, gondola, and funicular transport modes from DEFAULTS.TRANSPORT_MODES in src/config.js, POSSIBLE array in src/ui/options.js, and removed their icons and labels from emojiForMode/readableMode functions in both files. Updated detectMode token list in src/ui/departure.js to exclude unused mode keywords. Retained 6 modes: bus, tram, metro, rail, water, coach.
