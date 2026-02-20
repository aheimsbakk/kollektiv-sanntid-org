---
when: 2026-02-19T19:01:36Z
why: Update options panel when station changes while panel is open
what: Add updateFields() method to refresh panel fields when station changes
model: github-copilot/claude-sonnet-4.5
tags: [ui,options-panel,ux,reactivity]
---

Created updateFields() method in options panel to refresh all input fields with current DEFAULTS. Called when user selects different station from dropdown while options panel is open. Refactored open() to use updateFields() for DRY. Exposed updateFields in return object and called from handleStationSelect when panel is open. Version bumped to 1.14.3. Files: src/ui/options.js, src/app.js, src/config.js, src/sw.js.
