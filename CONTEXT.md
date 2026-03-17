Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.4.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration. OSM feature complete and committed.

Last 3 Changes:

- Cleanup osm-button.js + CSS padding (v1.40.4): removed stale duplicate code block; fixed .osm-status padding to 6px
- Fix OSM status placement (v1.40.3): replace body toast with inline .osm-status below the map button; reuses GPS dropdown error style; navigate same tab
- Fix OSM button UX (v1.40.2): show osmNoCoords toast (auto-dismiss 3 s) on missing coords; clear stale lat/lon on re-type; LAT/LON passed through validateOptions

OSM Feature Summary (complete as of v1.40.4):

- 🗺️ button in GPS bar; navigates same tab to OSM Transport layer with pin
- coords flow: geocoder.js → station-autocomplete → options/index.js → handlers.js → DEFAULTS.LAT/LON
- GPS dropdown and favorites also store lat/lon; share URL is 5-element backward-compat array
- No-coords: inline .osm-status error below button, auto-dismiss 3 s

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
