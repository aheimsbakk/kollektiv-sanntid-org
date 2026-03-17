---
when: 2026-03-17T21:12:33Z
why: OSM alert box did not visually match GPS alert box — shell and inner text padding were collapsed into one element
what: split osm-status into shell + inner child to mirror exact GPS dropdown two-level structure
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, osm-button, ui]
---

Split `statusEl` in `src/ui/osm-button.js` into a shell div (`.osm-status`, `padding:6px`, bg, shadow) and an inner div (`.gps-dropdown-status.gps-dropdown-error`, `padding:8px`, danger color) — mirroring the exact two-level DOM structure used by `.gps-dropdown-menu` + `.gps-dropdown-status`. Removed `white-space:nowrap` from `.osm-status` in `src/css/gps-dropdown.css` (already inherited from `.gps-dropdown-status`). Version bumped to 1.40.5.
