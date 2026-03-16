---
when: 2026-03-16T19:50:07Z
why: Entur's realtime feed emits sub-minute time adjustments for on-time vehicles, causing nearly every tracked departure to show a false red dot.
what: Fix delay indicator false positives by applying a 60 s minimum threshold via DELAY_THRESHOLD_MS
model: opencode/claude-sonnet-4-6
tags: [bugfix, realtime, delay, threshold, departure, docs]
---

Added `DELAY_THRESHOLD_MS = 60_000` to `src/config.js` and updated `isDepartureDelayed()` in `src/ui/departure.js` to require `expected − aimed >= 60 s` before showing the red dot. Three new threshold boundary tests added to `tests/departure-delay.test.mjs` (exactly 60 s, 30 s noise, 59 s noise). README updated to document the 1-minute threshold and consolidate the duplicate delay indicator entries. Bumped to v1.39.1.
