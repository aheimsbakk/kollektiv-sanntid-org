---
when: 2026-02-27T23:35:58Z
why: make favorites respect transport modes and update heart immediately on theme change
what: favorites are now mode-aware; heart icon and layout made configurable and consistent
model: github-copilot/gpt-5-mini
tags: [favorites,theme,tests]
---

Made favorites mode-aware (stopId + modes). Heart button now updates immediately when the theme changes and uses configurable emojis from config.js. Added tests for favorites and toggle-all behavior and aligned heart button styling with other header buttons. Files touched: src/ui/station-dropdown.js, src/ui/ui.js, src/ui/theme-toggle.js, src/config.js, src/style.css, tests/*.mjs
