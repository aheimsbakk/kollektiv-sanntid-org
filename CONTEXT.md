Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.39.1.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fix delay indicator false positives (v1.39.1): DELAY_THRESHOLD_MS=60000 in config.js; isDepartureDelayed() now requires expected−aimed >= 60 s; sub-minute Entur tracking noise no longer triggers red dot; README consolidated and clarified
- Departure delay indicator (v1.39.0): red ● dot when realtime=true AND aimed < expected; isDepartureDelayed() in departure.js; .indicator--delayed CSS uses --danger token; indicator rendered as <span>
- Fix keyboard tab order (v1.38.12): explicit tabIndex 1–8 on GPS→share→theme→settings→heart→station→footer links; DOM append order no longer affects keyboard navigation

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
