Overall Context: Dependency-free departure board using Entur APIs with realtime data, intelligent autocomplete with client-side re-ranking, Norwegian character support (æøå), complete transport mode coverage. Service worker now uses versioned caching for proper updates.

Current Goal: Ensure smooth deployment and update experience. Service worker cache invalidation on new deployments.

Last 3 Changes:
- agents/worklogs/2026-02-17-19-46-fix-sw-cache-version.md
- agents/worklogs/2026-02-16-22-17-fix-storen-autocomplete.md
- agents/worklogs/2026-02-16-22-12-remove-unused-modes.md

Next Steps:
- Display realtime status indicators (cancellation, predictionInaccurate) in UI
- Show platform/quay info from quay.publicCode field
