Current Goal: Implement dependency-free pure JS+CSS departure board, add Node-local tests, and surface reliable transport-mode info so the UI shows correct transport emojis.

Last 6 Changes:
- agent/worklogs/2026-02-15-request-mode-fields.md
- agent/worklogs/2026-02-15-compact-mode-checkboxes.md
- agent/worklogs/2026-02-15-shrink-station-and-countdown.md
- agent/worklogs/2026-02-15-03-30-loosen-gap-destination-countdown.md
- agent/worklogs/2026-02-15-03-40-loosen-gap-half.md
- agent/worklogs/2026-02-15-03-50-add-css-comments.md

Next Steps:
- Prefer explicit parsing of `serviceJourney.journeyPattern.line.transportMode` when present; keep recursive fallback for robustness.
- If server responses omit mode for a stop, consider a conservative heuristic mapping from `line.publicCode`/destination strings.

Recent UI changes:
- moved transport emoji to follow the station/destination name (was before countdown); added matching icons in Settings.
- compacted transport-mode checkboxes (row-wrapping) and reduced station/countdown/icon sizes by 20%.
- removed the floating emoji debug UI and no longer write snapshots to `window.__EMOJI_DEBUG__` by default.
- tightened internal spacing then adjusted: `.departure { row-gap: 12px }` and `.departures { gap: 12px }` to align destination↔countdown spacing with inter-station spacing.
- reduced gap between station name and transport icon: `.departure-destination gap` → `8px`, `.departure-emoji margin-right` → `2px`.

Debugging: debug hook remains opt-in — set `window.__ENTUR_DEBUG_PANEL__ = fn` to receive request/response metadata from `fetchDepartures`.

Tests: added `tests/entur.query.line.test.mjs` (query shape) and `tests/entur.parse.mode.test.mjs` (parsing/normalization).

Primary files changed: `src/entur.js`, `src/ui/departure.js`, `src/ui/options.js`, `src/style.css`, tests/*
