Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.11.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration. OSM feature complete and fully polished.

Last 3 Changes:

- Fix silent catch blocks (v1.40.11): replaced 7 silent `catch (_)` blocks with `console.warn` in settings.js, handlers.js, url-import.js, geocoder.js
- Fix OSM button on reload (v1.40.6→1.40.10): restore LAT/LON from favorites unconditionally; persist LAT/LON in saveSettings; strict null guards; sw.js ASSETS; flex-column layout
- Fix OSM alert style (v1.40.5): split osm-status into shell + inner child (mirrors exact GPS dropdown two-level DOM structure)

OSM Feature Summary (complete as of v1.40.11):

- 🗺️ button in GPS bar; navigates same tab to OSM Transport layer with pin
- coords flow: geocoder.js → station-autocomplete → options/index.js → handlers.js → DEFAULTS.LAT/LON
- GPS dropdown and favorites also store lat/lon; share URL is 5-element backward-compat array
- No-coords: inline .osm-status error below button, auto-dismiss 3 s; style matches GPS dropdown exactly
- Coords restored from matching favorite by stopId on every startup (including reload)

Next Steps:

- No outstanding items — all H/M priority issues resolved
