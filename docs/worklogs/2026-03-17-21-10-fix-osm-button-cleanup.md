---
when: 2026-03-17T21:10:11Z
why: remove stale duplicate code from osm-button.js and correct .osm-status shell padding
what: clean up osm-button.js leftover junk block and fix CSS padding to 6px
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, osm-button, cleanup]
---

Removed the stale duplicate function block that lingered after the corruption fix in `src/ui/osm-button.js` (diff showed deletions of dead `buildOsmUrl`/`showOsmToast`/`createOsmButton` duplicates). Fixed `.osm-status` shell padding from `6px 8px` to `6px` in `src/css/gps-dropdown.css` to match the GPS dropdown menu shell. Version bumped to 1.40.4.
