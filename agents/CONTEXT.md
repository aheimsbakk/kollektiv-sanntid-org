Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker with 5-second countdown update notification showing version upgrade (from x to y), complete asset caching, proper version display updates, and validation tests. Options panel with change detection (only saves when values change), transport modes, multilingual (12 languages including Polish), auto-select on input focus, centered station dropdown (max 5 recent). CSS refactored for dark/light mode prep.

Current Goal: Implement dark/light mode switching, then add realtime status indicators and platform info.

Last 3 Changes:
- agents/worklogs/2026-02-18-20-11-update-notification-fix.md
- agents/worklogs/2026-02-18-20-06-options-change-detection.md
- agents/worklogs/2026-02-18-19-56-polish-and-update-delay.md

Next Steps:
- Implement dark/light mode theme switching
- Display realtime status indicators (cancellation, predictionInaccurate)
- Show platform/quay info from quay.publicCode field
