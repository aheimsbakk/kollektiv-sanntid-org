---
when: 2026-02-20T12:35:12Z
why: Display platform/gate information compactly for better user orientation
what: Add stacked platform display with location-based symbols
model: github-copilot/claude-sonnet-4.5
tags: [feature, ui, platform-display, config]
---

Implemented stacked platform/gate/stop display after transport emoji. Updated config.js PLATFORM_SYMBOLS to use location-based symbols (platform, gate, stop, berth) instead of transport-based. Modified src/ui/departure.js to detect quay type from publicCode format (numeric=platform, letter=gate/stop) and render stacked symbol+code in small vertical layout. Added .platform-stacked CSS class in src/style.css for compact vertical display. Symbols are fully configurable. Bumped version to 1.18.0.
