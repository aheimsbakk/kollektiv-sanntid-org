---
when: 2026-02-19T17:34:30Z
why: Fix options panel not reflecting current station when opened
what: Update input fields with current defaults when panel opens
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, ui, options-panel]
---

Fixed bug where selecting a station from the dropdown didn't update the station name field in the options panel. Added code to refresh all input fields (station name, stopId, departures, interval, text size, transport modes) with current defaults when the panel opens. Version bumped to 1.11.1.
