---
when: 2026-02-17T20:24:57Z
why: Improve keyboard navigation and autocomplete UX in options panel
what: Add auto-select first autocomplete item and sequential Enter key navigation
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, ui, options, keyboard-navigation, accessibility]
---

Modified src/ui/options.js to auto-select first autocomplete item when Enter is pressed or station input loses focus. Added sequential Enter key navigation flow: station name → number of departures → fetch interval → text size → Apply button. Version bumped to 1.3.0.
