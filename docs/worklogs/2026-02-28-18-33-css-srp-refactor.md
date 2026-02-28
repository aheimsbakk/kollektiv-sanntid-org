---
when: 2026-02-28T18:33:10Z
why: Monolithic style.css violated SRP; splitting into focused component files improves maintainability and mirrors the existing JS module structure.
what: Refactor style.css into 16 focused component stylesheets under src/css/
model: opencode/claude-sonnet-4-6
tags: [refactor, css, srp, buttons, pwa]
---

Split `src/style.css` (847 lines) into 16 single-responsibility files under `src/css/` (tokens, base, buttons, layout, utils, header, toolbar, departures, options-panel, autocomplete, transport-modes, language-switcher, share-modal, toasts, footer, debug); `src/style.css` is now a pure `@import` manifest. Unified all three global toolbar buttons (share, theme, gear) onto the `header-btn` class for consistent 26px icon size — fixing a typo (`header-button`) on the share button. Updated `src/sw.js` ASSETS list with all 16 new `./css/*.css` paths to preserve offline caching. `BLUEPRINT.md` and `CONTEXT.md` updated to reflect the new CSS architecture. Bumped to v1.31.7.
