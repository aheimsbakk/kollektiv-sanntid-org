Overall Context: Dependency-free departure board using Entur APIs with realtime data, intelligent autocomplete with client-side re-ranking, Norwegian character support (æøå), complete transport mode coverage. Service worker uses versioned caching for proper updates. Agent protocol enforces version bumping on every commit.

Current Goal: Maintain consistent deployment and update workflow with automated version management.

Last 3 Changes:
- agents/worklogs/2026-02-17-19-48-update-agents-protocol.md
- agents/worklogs/2026-02-17-19-46-fix-sw-cache-version.md
- agents/worklogs/2026-02-16-22-17-fix-storen-autocomplete.md

Next Steps:
- Display realtime status indicators (cancellation, predictionInaccurate) in UI
- Show platform/quay info from quay.publicCode field
