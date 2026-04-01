---
when: 2026-04-01T19:20:08Z
why: delayed indicator symbol was hardcoded; centralising it in REALTIME_INDICATORS keeps all indicator symbols in one place
what: use REALTIME_INDICATORS.delayed for delayed departures indicator symbol
model: github-copilot/claude-sonnet-4.6
tags: [refactor, config, departure, realtime]
---

Added `delayed` key (`⬦`) to `REALTIME_INDICATORS` in `src/config.js`. Updated `createDepartureNode` in `src/ui/departure.js` to use `REALTIME_INDICATORS.delayed` when `isDepartureDelayed` is true, instead of falling through to the live `realtime` symbol. Bumped to v1.40.16.
