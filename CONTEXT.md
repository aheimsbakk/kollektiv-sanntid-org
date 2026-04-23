Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.24.

Current Goal: Stable mobile PWA experience with polished top-left toolbar layout.

Last 3 Changes:

- GPS coords preserved on settings change (v1.40.24): added _explicitSelection flag to station-autocomplete; applyChanges() falls back to defaults.LAT/LON unless a new station was explicitly picked; keyboard-Enter in favorites dropdown now passes lat/lon via dataset
- Icon update (v1.40.21): replaced KS with 🚏 across all SVG icons, added maskable icons, updated manifest and service worker
- Arrow symbols configurable (v1.40.20): added STATION_DROPDOWN.ARROW_COLLAPSED/ARROW_EXPANDED to config.js; station-dropdown.js now reads from config instead of hardcoded ▼/▲

Next Steps:

- No outstanding items — all H/M priority issues resolved
