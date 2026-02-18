Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker caching. Options panel with transport modes, multilingual (8 languages), station dropdown (max 5 recent). CSS refactored for dark/light mode: max 10% transparency, white text, unified dropdown styles with high-contrast hover states.

Current Goal: Implement dark/light mode switching, then add realtime status indicators and platform info.

Last 3 Changes:
- agents/worklogs/2026-02-18-18-47-unified-dropdown-styles.md
- agents/worklogs/2026-02-18-18-23-subtle-text-glow.md
- agents/worklogs/2026-02-18-18-20-visible-text-shadows.md

Next Steps:
- Implement dark/light mode theme switching
- Display realtime status indicators (cancellation, predictionInaccurate)
- Show platform/quay info from quay.publicCode field
