Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.13.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration. OSM feature complete and fully polished.

Last 3 Changes:

- Fix OSM status thin-column collapse (v1.40.13): added width:max-content + min-width:160px to .osm-status so error text renders as a proper box, not a single-character column
- Fix GPS/OSM status box overflow (v1.40.12): added max-width: calc(100vw - 36px) to .gps-dropdown-menu and .osm-status; status text now wraps instead of overflowing screen
- Fix silent catch blocks (v1.40.11): replaced 7 silent `catch (_)` blocks with `console.warn` in settings.js, handlers.js, url-import.js, geocoder.js

Next Steps:

- No outstanding items — all H/M priority issues resolved
