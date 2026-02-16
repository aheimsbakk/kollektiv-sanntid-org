Overall Context: Dependency-free departure board using Entur APIs with realtime data, mode filtering, and reliable autocomplete that stores stopIds.

Current Goal: Ensure autocomplete selections work reliably by using stored stopIds instead of re-looking up labels.

Last 3 Changes:
- agents/worklogs/2026-02-16-21-43-fix-autocomplete-stopid.md
- agents/worklogs/2026-02-16-21-34-refine-autocomplete-realtime.md
- agents/worklogs/2026-02-16-19-21-add-station-autocomplete.md

Next Steps:
- Consider displaying realtime status indicators (cancellation, predictionInaccurate) in UI
- Optionally show platform/quay info from quay.publicCode field
