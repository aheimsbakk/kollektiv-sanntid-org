---
when: 2026-03-16T19:41:55Z
why: Visualise delayed departures so users can immediately see when a live-tracked service is running late.
what: Add red dot delay indicator for realtime departures where aimedDepartureISO < expectedDepartureISO
model: opencode/claude-sonnet-4-6
tags: [feature, realtime, ui, departure, delay, css]
---

Added `isDepartureDelayed()` pure helper to `src/ui/departure.js` (exported for testing); returns true only when `realtime === true` AND `Date.parse(aimedDepartureISO) < Date.parse(expectedDepartureISO)`. The `{indicator}` template placeholder is now rendered as a `<span>` DOM element via a reusable `insertElement()` TreeWalker helper, allowing the delayed state to apply `class="indicator--delayed"` with `aria-label="delayed"`. Added `.indicator--delayed { color: var(--danger); }` to `src/css/departures.css`. Nine-assertion unit test added in `tests/departure-delay.test.mjs` and registered in `tests/run.mjs`. README, BLUEPRINT, and CONTEXT updated. Bumped to v1.39.0.
