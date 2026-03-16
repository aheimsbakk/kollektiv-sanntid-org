Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.15.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Departure delay indicator (v1.38.15): red ● dot when realtime=true AND aimedDepartureISO < expectedDepartureISO; isDepartureDelayed() in departure.js; .indicator--delayed CSS class uses --danger token; indicator rendered as <span> for independent coloring
- Fix keyboard tab order (v1.38.12): explicit tabIndex 1–8 on GPS→share→theme→settings→heart→station→footer links; DOM append order no longer affects keyboard navigation
- Unify dropdown styling and interaction (v1.38.11): shared --dropdown-item-gap token, 8px item padding, :focus-visible, GPS max-width removed, autocomplete li→button, GPS keyboard nav (↑↓/Enter/ESC)

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
