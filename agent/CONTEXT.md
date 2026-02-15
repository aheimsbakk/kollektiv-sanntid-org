Current Goal: Implement dependency-free pure JS+CSS departure board and surface reliable transport-mode info.

Last 3 Changes:
- agent/worklogs/2026-02-15-06-10-client-filter-fallback.md
- agent/worklogs/2026-02-15-05-20-prefer-modes-variant-worklog.md
- agent/worklogs/2026-02-15-18-05-scan-repo-changes.md

Next Steps:
- Prefer explicit parsing of `serviceJourney.journeyPattern.line.transportMode` when present.
- When missing, map conservatively from `line.publicCode`/destination strings.
