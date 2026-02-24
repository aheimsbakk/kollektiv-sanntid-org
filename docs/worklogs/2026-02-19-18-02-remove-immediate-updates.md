---
when: 2026-02-19T18:02:18Z
why: Fix conflict between immediate updates and saving modes with stations
what: Remove all immediate updates in options panel, require Apply button
model: github-copilot/claude-sonnet-4.5
tags: [fix, ui, options-panel, ux]
---

Removed all immediate update behavior from options panel to fix conflict with the new "save modes with stations" feature. Previously, transport mode checkboxes and text size applied changes immediately, which conflicted with saving station+modes combinations. Now all changes (station, modes, departures, interval, text size) only apply when the Apply button is clicked. Version bumped to 1.12.1.

**Files modified:** src/ui/options.js, src/config.js, src/sw.js
