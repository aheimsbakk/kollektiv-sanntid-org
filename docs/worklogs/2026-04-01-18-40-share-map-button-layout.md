---
when: 2026-04-01T18:40:40Z
why: improve top-left toolbar layout by repositioning share and map buttons
what: move share button to top-left gps-bar (right of compass), move map button below compass
model: github-copilot/claude-sonnet-4.6
tags: [ui, layout, toolbar, readme]
---

Moved the share button (📋) from the top-right `.share-bar` into the top-left `.gps-bar` alongside the compass, and restructured the gps-bar to a two-row layout (🧭 📋 / 🗺️) using a `.gps-bar__col` flex column for compass + OSM and share floating beside it. Removed `.share-bar` CSS and JS entirely. Updated `README.md` with the map button functionality, corrected share button location, and added the "OpenStreetMap View" feature section. Bumped to v1.40.14. Files touched: `src/app/gps-bar.js`, `src/app/action-bar.js`, `src/app.js`, `src/css/toolbar.css`, `README.md`.
