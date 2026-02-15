
Current Goal: Implement dependency-free pure JS+CSS departure board and surface reliable transport-mode info.

Last 5 Changes:
- agent/worklogs/2026-02-15-06-10-client-filter-fallback.md
- agent/worklogs/2026-02-15-05-20-prefer-modes-variant-worklog.md
- agent/worklogs/2026-02-15-18-05-scan-repo-changes.md
- agent/worklogs/2026-02-15-18-30-inline-departure-emoji.md
- agent/worklogs/2026-02-15-18-50-replace-inline-debug-and-css-tokens.md

Next Steps:
- Prefer explicit parsing of `serviceJourney.journeyPattern.line.transportMode` when present.
- When missing, map conservatively from `line.publicCode`/destination strings.
- Replace remaining color literals and inline JS styles that set colors/backgrounds so CSS variables control theming.
- Run `node tests/run.mjs` and visually test narrow viewports; decide whether options panel should overlay on small screens.
