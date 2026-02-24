---
when: 2026-02-20T10:59:00Z
why: Move tooltip to correct station name field on main screen
what: Fix stationNameTooltip placement to station dropdown button
model: github-copilot/claude-sonnet-4.5
tags: [ui,tooltip,fix]
---

Moved stationNameTooltip from options panel input to station dropdown button on main screen. The tooltip now correctly appears on the button that opens favorites dropdown. Version bumped to 1.16.2. Files: src/ui/station-dropdown.js:126, src/ui/options.js:15.
