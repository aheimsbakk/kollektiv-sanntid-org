Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker with automatic update reloading, proper CSS/asset cache invalidation, and version validation tests. Options panel with transport modes, multilingual (11 languages: Norwegian, Deutsch, English, Español, Français, Ελληνικά, हिन्दी, Íslenska, Italiano, فارسی, Українська), centered station dropdown (max 5 recent). CSS refactored for dark/light mode: max 10% transparency, white text, unified button styles (including gear button) with consistent backgrounds and borders, centered layout.

Current Goal: Implement dark/light mode switching, then add realtime status indicators and platform info.

Last 3 Changes:
- agents/worklogs/2026-02-18-19-35-center-dropdown.md
- agents/worklogs/2026-02-18-19-31-versioned-cache-fix.md
- agents/worklogs/2026-02-18-19-27-gear-button-styling.md

Next Steps:
- Implement dark/light mode theme switching
- Display realtime status indicators (cancellation, predictionInaccurate)
- Show platform/quay info from quay.publicCode field
