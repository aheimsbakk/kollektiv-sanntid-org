Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.2.

Current Goal: Stable mobile PWA experience with OpenStreetMap integration.

Last 3 Changes:

- Fix OSM button UX (v1.40.2): show osmNoCoords toast (auto-dismiss 3 s) on missing coords; clear stale lat/lon on re-type; LAT/LON passed through validateOptions
- Fix options panel coords (v1.40.1): lat/lon now flow from geocoder.js → station-autocomplete.js (getLat/getLon) → options/index.js applyChanges → handlers.js onApplySettings → DEFAULTS.LAT/LON
- OpenStreetMap button (v1.40.0): 🗺️ button in GPS bar opens OSM Transport layer with pin at current stop; lat/lon stored in favorites and share URLs (5-element array, backward-compat); osmTooltip/osmNoCoords added to all 12 languages

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
