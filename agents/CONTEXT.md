Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker with 5-second countdown before auto-reload, complete asset caching, proper version display updates, and validation tests. Options panel with transport modes, multilingual (12 languages including Polish), auto-select on input focus, centered station dropdown (max 5 recent). CSS refactored for dark/light mode prep: max 10% transparency, white text, unified button styles, centered layout.

Current Goal: Implement dark/light mode switching, then add realtime status indicators and platform info.

Last 3 Changes:
- agents/worklogs/2026-02-18-19-56-polish-and-update-delay.md
- agents/worklogs/2026-02-18-19-50-auto-select-inputs.md
- agents/worklogs/2026-02-18-19-43-complete-assets-cache.md

Next Steps:
- Implement dark/light mode theme switching
- Display realtime status indicators (cancellation, predictionInaccurate)
- Show platform/quay info from quay.publicCode field
