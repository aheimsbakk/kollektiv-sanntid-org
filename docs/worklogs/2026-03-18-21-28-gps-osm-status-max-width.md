---
when: 2026-03-18T21:28:51Z
why: GPS and OSM error/status boxes overflowed the screen beyond the rightmost toolbar buttons
what: Constrain GPS dropdown and OSM status box width to viewport minus gutters
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, gps, osm, responsive]
---

Added `max-width: calc(100vw - 36px)` to `.gps-dropdown-menu` and `.osm-status` in `src/css/gps-dropdown.css` so neither box can exceed the right edge of the screen (aligning with the rightmost toolbar buttons at 18px from each side). Also added `overflow-x: hidden` to the dropdown and changed `.gps-dropdown-status` from `white-space: nowrap` to `white-space: normal; word-break: break-word` so long error strings wrap cleanly inside the constrained width. Bumped to v1.40.12.
