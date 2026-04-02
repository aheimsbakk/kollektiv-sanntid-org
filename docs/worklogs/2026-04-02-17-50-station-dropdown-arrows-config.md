---
when: 2026-04-02T17:50:17Z
why: Arrow symbols in the station dropdown were hardcoded, making them impossible to customise without editing component logic.
what: Move station dropdown arrow symbols (▼/▲) from hardcoded strings to STATION_DROPDOWN config constant.
model: github-copilot/claude-sonnet-4.6
tags: [config, station-dropdown, refactor]
---

Added `STATION_DROPDOWN` object (`ARROW_COLLAPSED`, `ARROW_EXPANDED`) to `src/config.js` alongside the existing `STATION_LINE_TEMPLATE`. Updated `src/ui/station-dropdown.js` to import and use the new constants in all three places that previously held hardcoded `▼`/`▲` literals. Bumped version to 1.40.21.
