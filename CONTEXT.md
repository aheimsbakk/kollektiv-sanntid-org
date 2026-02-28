Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.31.6.

Current Goal: Maintain and extend the production app; codebase refactored for rules compliance.

Last 3 Changes:
- src/style.css split into 16 focused files under src/css/ (tokens, base, buttons, layout, header, toolbar, departures, options-panel, autocomplete, transport-modes, language-switcher, share-modal, toasts, footer, debug, utils); style.css is now an @import manifest only
- src/sw.js — ASSETS list updated with all src/css/*.css paths for offline caching
- src/ui/share-button.js + src/app/action-bar.js — toolbar button classes unified to header-btn for consistent 26px icon size

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
