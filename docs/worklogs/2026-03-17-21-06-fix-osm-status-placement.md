---
when: 2026-03-17T21:06:04Z
why: OSM no-coords feedback was a body-level toast; should appear below the map button like GPS status text
what: Replace OSM toast with inline status message below the map button using GPS dropdown style
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, osm, ux, css, gps-dropdown]
---

Replaced the body-level `#osm-toast` with an inline `.osm-status` element (reusing `.gps-dropdown-status.gps-dropdown-error` classes) positioned absolutely below the 🗺️ button, mirroring the GPS dropdown's error text pattern. `gps-bar.js` wraps the OSM button in a `div.gps-dropdown-container` and appends `btn.statusEl` inside it. Added `.osm-status` CSS to `gps-dropdown.css` and removed the now-unused `#osm-toast` rules from `toasts.css`. Version bumped 1.40.2 → 1.40.3.
