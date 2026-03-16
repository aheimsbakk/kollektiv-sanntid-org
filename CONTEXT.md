Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.39.2.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Raise delay threshold to 120 s (v1.39.2): DELAY_THRESHOLD_MS=120000; red dot now requires 2 min late; boundary tests updated; README updated
- Fix delay indicator false positives (v1.39.1): DELAY_THRESHOLD_MS=60000; isDepartureDelayed() requires expected−aimed >= threshold; sub-minute noise suppressed
- Departure delay indicator (v1.39.0): red ● dot when realtime=true AND aimed < expected; isDepartureDelayed() in departure.js; .indicator--delayed CSS uses --danger token

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
