---
when: 2026-03-16T17:22:17Z
why: Three files were independently declaring the same transport mode list, risking silent divergence if config.js was updated
what: Replace local validModes arrays with ALL_TRANSPORT_MODES import from config.js
model: github-copilot/claude-sonnet-4.6
tags: [dry, refactor, config, transport-modes]
---

Removed duplicate `validModes`/`VALID_MODES` declarations from `src/app/settings.js`, `src/entur/gps-search.js`, and `src/ui/share-button.js`, replacing each with an import of `ALL_TRANSPORT_MODES` from `src/config.js`. Also updated `ANALYZE.md` to mark H1 as resolved. Bumped version to 1.38.14.
