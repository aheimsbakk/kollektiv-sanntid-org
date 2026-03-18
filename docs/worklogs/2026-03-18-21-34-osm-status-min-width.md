---
when: 2026-03-18T21:34:10Z
why: OSM error status box collapsed to a thin single-character column after max-width was introduced
what: Add width and min-width to .osm-status to prevent thin-column collapse
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, osm, responsive]
---

Added `width: max-content` and `min-width: 160px` to `.osm-status` in `src/css/gps-dropdown.css`. Without an explicit width the box shrank to its minimum intrinsic size and wrapped the error text into a single-character column; the new rules let it grow naturally to fit the text while still being capped by the existing `max-width: calc(100vw - 36px)`. Bumped to v1.40.13.
