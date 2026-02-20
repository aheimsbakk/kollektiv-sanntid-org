---
when: 2026-02-20T10:27:52Z
why: Make station name label more precise to include bus stops
what: Updated stationName label to include stops in all languages
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, ux, i18n, clarity]
---

Changed stationName label from "Station name" to "Station or stop name" across all 12 supported languages in `src/i18n.js`. More accurately reflects that users can enter bus stops, tram stops, and other transit stops, not just train stations. Improves clarity and precision of the interface. Version bumped to 1.15.8.
