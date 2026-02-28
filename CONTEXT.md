Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.32.0.

Current Goal: Maintain and extend the production app; codebase refactored for rules compliance.

Last 3 Changes:
- src/css/header.css — fixed station dropdown hover styling by adding :not(:disabled) for CSS specificity parity with global button:hover rule
- src/config.js — added NUM_FAVORITES (default 10) to DEFAULTS; src/ui/station-dropdown.js now imports from config instead of hardcoded MAX_RECENT
- src/style.css split into 16 focused files under src/css/ (tokens, base, buttons, layout, header, toolbar, departures, options-panel, autocomplete, transport-modes, language-switcher, share-modal, toasts, footer, debug, utils); style.css is now an @import manifest only

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
