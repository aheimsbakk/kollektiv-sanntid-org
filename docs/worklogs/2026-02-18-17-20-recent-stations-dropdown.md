---
when: 2026-02-18T17:20:53Z
why: Add recent stations dropdown for quick navigation
what: Implemented interactive station dropdown with localStorage persistence
model: github-copilot/claude-sonnet-4.5
tags: [feature, ui, dropdown, localStorage, i18n]
---

## Recent Stations Dropdown Feature (v1.6.0)

Replaced static station title with interactive dropdown showing 5 most recent stations. Created `src/ui/station-dropdown.js` with localStorage-based history (max 5, FIFO with reordering). Implemented keyboard navigation (↑/↓, Enter, Escape) and click-to-expand/collapse behavior. Integrated into `src/ui/ui.js` and `src/app.js` with automatic updates when station changes via options panel. Added CSS styling in `src/style.css` matching existing design patterns. Added translations for all 8 languages in `src/i18n.js`. Created unit tests in `tests/station-dropdown.test.mjs` covering localStorage operations and edge cases. All tests pass.
