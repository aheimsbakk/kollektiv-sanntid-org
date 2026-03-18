Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.12.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration. OSM feature complete and fully polished.

Last 3 Changes:

- Fix GPS/OSM status box overflow (v1.40.12): added max-width: calc(100vw - 36px) to .gps-dropdown-menu and .osm-status; status text now wraps instead of overflowing screen
- Fix silent catch blocks (v1.40.11): replaced 7 silent `catch (_)` blocks with `console.warn` in settings.js, handlers.js, url-import.js, geocoder.js
- Fix OSM button on reload (v1.40.6→1.40.10): restore LAT/LON from favorites unconditionally; persist LAT/LON in saveSettings; strict null guards; sw.js ASSETS; flex-column layout

Next Steps:

- No outstanding items — all H/M priority issues resolved
