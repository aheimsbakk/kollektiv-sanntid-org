Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker caching. Options panel with transport modes, multilingual (11 languages: Norwegian, Deutsch, English, Español, Français, Ελληνικά, हिन्दी, Íslenska, Italiano, فارسی, Українська), station dropdown (max 5 recent). CSS refactored for dark/light mode: max 10% transparency, white text, unified dropdown and button styles with high-contrast hover states. Flag buttons enlarged to 1.8em.

Current Goal: Implement dark/light mode switching, then add realtime status indicators and platform info.

Last 3 Changes:
- agents/worklogs/2026-02-18-18-56-add-three-languages.md
- agents/worklogs/2026-02-18-18-52-unified-button-styles.md
- agents/worklogs/2026-02-18-18-47-unified-dropdown-styles.md

Next Steps:
- Implement dark/light mode theme switching
- Display realtime status indicators (cancellation, predictionInaccurate)
- Show platform/quay info from quay.publicCode field
