Overall Context: Dependency-free departure board using Entur APIs with realtime data, intelligent autocomplete with client-side re-ranking, Norwegian character support (æøå), complete transport mode coverage. Service worker uses versioned caching. Options panel with 3x2 transport modes table (Bus/Metro, Tram/Rail, Water/Coach), improved keyboard navigation, and validated inputs (departures ≥1, fetch interval ≥20s). Full multilingual support with 8 languages, robust browser language detection (including nb/nn→no mapping), and instant language switching without page reload.

Current Goal: Enhance UX with realtime status indicators and platform information.

Last 3 Changes:
- agents/worklogs/2026-02-17-21-18-swap-tram-rail.md
- agents/worklogs/2026-02-17-21-11-validate-num-departures.md
- agents/worklogs/2026-02-17-21-08-validate-fetch-interval.md

Next Steps:
- Display realtime status indicators (cancellation, predictionInaccurate) in UI
- Show platform/quay info from quay.publicCode field
