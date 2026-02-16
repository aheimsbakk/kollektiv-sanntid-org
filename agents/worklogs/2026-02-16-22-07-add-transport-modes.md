---
when: 2026-02-16T22:07:50Z
why: Support all transport modes from Entur JourneyPlanner API per transport_modes.md
what: Add air, coach, gondola, funicular modes with icons to config and UI
model: github-copilot/claude-sonnet-4.5
tags: [transport-modes, ui, config, icons]
---

Added missing transport modes (air ✈️, coach 🚐, gondola 🚡, funicular 🚟) to DEFAULTS.TRANSPORT_MODES in src/config.js. Updated emojiForMode and readableMode functions in src/ui/options.js and src/ui/departure.js to include icons and labels for all modes. Updated detectMode token list to recognize new modes.
