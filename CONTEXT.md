Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.6.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration. OSM feature complete and fully polished.

Last 3 Changes:

- Fix OSM button on reload (v1.40.6): restore LAT/LON from favorites unconditionally after station selection — loadSettings() was setting STOP_ID before the coord-restore guard ran, skipping it entirely
- Fix OSM alert style (v1.40.5): split osm-status into shell + inner child (mirrors exact GPS dropdown two-level DOM structure)
- Cleanup osm-button.js + CSS padding (v1.40.4): removed stale duplicate code block; fixed .osm-status shell padding to 6px

OSM Feature Summary (complete as of v1.40.6):

- 🗺️ button in GPS bar; navigates same tab to OSM Transport layer with pin
- coords flow: geocoder.js → station-autocomplete → options/index.js → handlers.js → DEFAULTS.LAT/LON
- GPS dropdown and favorites also store lat/lon; share URL is 5-element backward-compat array
- No-coords: inline .osm-status error below button, auto-dismiss 3 s; style matches GPS dropdown exactly
- Coords restored from matching favorite by stopId on every startup (including reload)

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
