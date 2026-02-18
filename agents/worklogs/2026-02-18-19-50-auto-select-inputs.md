---
when: 2026-02-18T19:50:51Z
why: Improve UX by auto-selecting text in input fields for easier editing
what: Added focus event listeners to auto-select text in options panel inputs
model: github-copilot/claude-sonnet-4.5
tags: [ui, ux, options, input, enhancement]
---

Added auto-select functionality on focus for station name, number of departures, and fetch interval inputs in src/ui/options.js. Users can now immediately type to replace existing values without manually deleting text. Bumped version to 1.8.6.
