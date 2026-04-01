---
when: 2026-03-17T21:17:33Z
why: map button should sit below the GPS button, not beside it
what: change .gps-bar flex direction from row to column
model: github-copilot/claude-sonnet-4.6
tags: [ui, css, osm-button, layout]
---

Added `flex-direction: column` to `.gps-bar` in `src/css/toolbar.css`. The OSM 🗺️ button now stacks vertically below the GPS 🧭 button. No JS changes needed. Version bumped to 1.40.7.
