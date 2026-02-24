---
when: 2026-02-19T18:05:38Z
why: Prevent station names and mode icons from wrapping in dropdown
what: Widen station dropdown and prevent line breaks
model: github-copilot/claude-sonnet-4.5
tags: [fix, ui, css, station-dropdown]
---

Fixed dropdown menu width to prevent station names with mode icons from wrapping to multiple lines. Changed min-width from 200px to 250px, added max-width 400px, set width to max-content for auto-sizing, and added white-space: nowrap to dropdown items. Dropdown now expands to fit content width. Version bumped to 1.12.2.

**Files modified:** src/style.css, src/config.js, src/sw.js
