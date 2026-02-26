# Departure Board — BLUEPRINT

Purpose
- Browser single‑page application that replicates the terminal departure board in `departure.sh`.
- No external dependencies, no build step. All source lives under `src/` and uses native ES modules + modern browser APIs.

High-level constraints
- No third‑party libraries or packages.
- Files under `src/`.
- Client-side only: no server component, no proxy, and no server instructions included in the repo.
- The app must function fully in the browser. If Entur's API blocks cross-origin requests, the app shows a clear error state; no demo/offline fallback mode (removed in v1.x).
- Keep accessibility and responsive design in mind.
- Follow agents protocol before committing: create `docs/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` and update `CONTEXT.md` (<=20 lines).

User-facing features
- Station header (clickable) opens favorites dropdown (up to 5 recent stations with saved settings).
- Up to N upcoming departures (configurable).
- Departure line: destination, realtime indicator (● live / ○ scheduled), line number, transport emoji, platform symbol+code.
- Cancelled departures shown with strikethrough and reduced opacity.
- Live countdown (MM:SS), updates every second.
- Platform/quay display with configurable symbol rules (bay ▣, gate ◆, platform ⚏, stop ▪, berth ⚓).
- Auto-centering both horizontally and vertically.
- Settings persisted to `localStorage` (`departure:settings`): station name, stop ID, N, modes, text size, fetch interval.
- Language persisted to `localStorage` (`departure:language`): 12 supported languages.
- Theme persisted to `localStorage` (`departure:theme`): light / auto / dark cycle.
- Share button: encodes full board config as compact base64 URL (`?b=`), backward-compatible with `?board=` (legacy).
- PWA: installable via `manifest.webmanifest`, offline-capable via service worker (`sw.js`).
- Auto-update flow: service worker detects new version, shows 5-second countdown toast, then reloads.
- No external fonts required — use system fonts + CSS for visual effect.

Architecture overview
- `src/index.html`       — entry point, minimal markup, loads `src/app.js` as module
- `src/app.js`           — bootstraps app, wires DOM, intervals, URL params, SW registration
- `src/config.js`        — all configurable constants: DEFAULTS, VERSION, emojis, template, platform symbol rules
- `src/entur.js`         — Entur GraphQL client (fetch wrapper, stop lookup, departure parse)
- `src/time.js`          — pure utilities: iso → epoch, format countdown
- `src/i18n.js`          — i18n strings for 12 languages; `t(key)` helper; language persistence
- `src/style.css`        — main stylesheet (CSS variables, themes, responsive layout)
- `src/icons.css`        — CSS-only icon/badge helpers
- `src/sw.js`            — service worker: versioned cache, offline support, skip-waiting flow
- `src/manifest.webmanifest` — PWA manifest (icons, theme color, display mode)
- `src/icons/`           — PWA icon assets
- `src/ui/`
  - `ui.js`              — DOM helpers, board element factory, render loop (minimize DOM thrash)
  - `departure.js`       — single departure component (template rendering, countdown update)
  - `header.js`          — station header toggle component
  - `options.js`         — settings/options panel component
  - `share-button.js`    — share button, URL encode/decode (base64 array format)
  - `station-dropdown.js`— favorites/recent stations dropdown (up to 5, with saved settings)
  - `theme-toggle.js`    — light/auto/dark theme cycle button
- No transpilation. Use `type="module"` for the scripts.

Data flow
- `app.js` reads persisted settings from `localStorage`, then checks URL params (`?b=` / `?board=`) for shared board import.
- On start and every FETCH_INTERVAL seconds: call `entur.fetchDepartures(stopId, n, modes)`.
- `entur.fetchDepartures` uses `fetch()` to POST to Entur GraphQL endpoint.
- Parse response to normalized JS objects:
  - `{ destination, lineNumber, transportMode, expectedDepartureISO, realtimeState, cancellation, quay: { publicCode } }`
- UI layer keeps last successful dataset; on new data diff update DOM nodes; always update countdown labels every second.
- On fetch failure show error state; keep previous data if available.

Entur API considerations
- Stop lookup: `GET https://api.entur.io/geocoder/v1/autocomplete?text=...&lang=en&size=10` — filters to `StopPlace` venue type.
- Departures: GraphQL POST to `https://api.entur.io/journey-planner/v3/graphql`.
- Query fields: `stopPlace(id) { estimatedCalls(numberOfDepartures, whiteListedModes) { expectedDepartureTime realtime cancellation serviceJourney { journeyPattern { line { publicCode transportMode } } } destinationDisplay { frontText } quays { publicCode } } }`
- Headers: `ET-Client-Name: kollektiv-sanntid-org`.
- CORS: The app calls Entur directly from the browser. On failure, shows a clear error state. No proxy or server code.

Time and timezone
- Parse ISO times using `Date.parse()`; work in UTC epoch ms then compute diff with `Date.now()`.
- Display "Now" for diff <= 0.
- Formatting: `MM:SS` (hours suppressed for typical transit use).
- Avoid heavy libraries: small helper functions in `src/time.js`.

UI/UX & styling
- CSS variables (`:root`): `--bg`, `--fg`, `--accent`, `--danger`, `--mono`, `--large-scale` plus theme overrides.
- Three themes: light / auto (system) / dark — toggled via `.theme-light`, `.theme-dark` on `<html>`, default follows `prefers-color-scheme`.
- Five text sizes applied as class on `<html>`: `text-size-tiny` → `text-size-xlarge`.
- Destination: large block using monospace font, heavy `font-size` + `text-shadow` for punch.
- Departure line rendered from `DEPARTURE_LINE_TEMPLATE` (configurable in `config.js`).
- Platform symbol selected by `PLATFORM_SYMBOL_RULES` (ordered rule list in `config.js`): water→berth, bus+alphanumeric→bay, bus+single-letter→gate, bus→stop, tram→stop, rail/metro→platform.
- Realtime indicator: `●` (solid, live) / `○` (hollow, scheduled) from `REALTIME_INDICATORS` in `config.js`.
- Cancellation: wraps line in `.departure-cancelled` (strikethrough + reduced opacity) via `CANCELLATION_WRAPPER` in `config.js`.
- Auto-centering: Flexbox column + `justify-content:center; align-items:center; min-height:100vh`.
- Responsive: text sizes reduce on small screens; vertical centering maintained.
- Accessibility: high contrast, ARIA labels, `role="status"` for countdown chip.

Internationalisation (i18n)
- All UI strings live in `src/i18n.js` as a keyed map per language code.
- `t(key)` returns the string for the current language (falls back to `en`).
- Language persisted in `localStorage` key `departure:language`.
- Supported: `en`, `no`, `de`, `es`, `it`, `el`, `fa`, `hi`, `is`, `uk`, `fr`, `pl`.
- Language switcher in options panel uses flag buttons; changing language updates all translatable strings in the open panel in-place (footer and tooltips refreshed via `onLanguageChange` callback — the panel is **not** recreated).

Share URL format
- Encoding: compact JSON array `[stationName, stopId, modes[], numDepartures, fetchInterval, textSize, language]` → JSON.stringify → btoa (URL-safe: `+`→`-`, `/`→`_`, strip `=`).
- URL param: `?b=<encoded>` (v1.24.0+). Legacy `?board=<encoded>` decoded for backward compat.
- Decoding detects array vs object format automatically.
- Opening a shared link applies settings, saves to `localStorage`, adds station to favorites, then clears URL param.
- Full spec: `docs/share_url_encoding.md`.

PWA & Service Worker
- `src/manifest.webmanifest`: name, icons, `display: standalone`, theme color.
- `src/sw.js`: versioned cache name (`kollektiv-v<VERSION>`), caches all app assets on install, serves from cache with network fallback.
- Update flow: new SW detected → 5-second countdown toast shows old→new version → `skipWaiting` → `controllerchange` triggers hard reload with `?t=<timestamp>` cache-bust.
- VERSION in `src/config.js` and `src/sw.js` must stay in sync — use `scripts/bump-version.sh`.

Performance & DOM update pattern
- Render template once per departure item; keep references to text nodes for countdown and situation.
- Only update the countdown text every second rather than re-paint full DOM.
- On new fetch, diff the departure array by stable key (destination + expectedDepartureISO) and only add/remove or reorder DOM nodes as needed.
- Use `requestAnimationFrame` sparingly for animations; timer uses `setInterval(1000)` to update times.

Error handling & fallback UX
- If station lookup fails: show error/empty state and keep previous data if available.
- If network error: log warning, keep previous data, update status chip.
- Header status chip shows countdown to next refresh ("Updating in Xs").
- No demo mode or manual JSON upload (removed).

Settings & persistence
- Settings stored in `localStorage` key `departure:settings` as JSON (mirrors DEFAULTS shape).
- Language stored in `localStorage` key `departure:language`.
- Theme stored in `localStorage` key `departure:theme`.
- URL params for shared boards only: `?b=` (array base64) or legacy `?board=` (object base64).

Testing & dev workflow (no deps)
- Manual smoke tests:
  - Load `src/index.html` via local server, confirm station lookup, departures, countdowns decrement.
  - Simulate network failure using devtools offline.

- Node-local unit tests:
  - Place tests under `tests/` as ESM modules (e.g. `tests/time.test.mjs`). Run: `node tests/run.mjs` or `npm test`.
  - Use Node's built-in `assert` API — no test framework.
  - Keep tests hermetic: no DOM APIs or `fetch`.

- Logging: minimal console logs only. `console.debug` is banned. Use `console.warn` for recoverable failures and `console.error` for unexpected errors. No empty `catch` blocks.

Security & privacy
- Never log tokens or secrets. Avoid embedding keys in the code.
- Explain CORS fallback without suggesting public proxies for production.

Current file tree (implemented)
- `src/index.html`
- `src/style.css`
- `src/icons.css`
- `src/app.js`
- `src/config.js`
- `src/entur.js`
- `src/time.js`
- `src/i18n.js`
- `src/sw.js`
- `src/manifest.webmanifest`
- `src/icons/`
- `src/ui/ui.js`
- `src/ui/departure.js`
- `src/ui/header.js`
- `src/ui/options.js`
- `src/ui/share-button.js`
- `src/ui/station-dropdown.js`
- `src/ui/theme-toggle.js`

Commit & agent protocol notes (required)
- Before committing, create a worklog: `docs/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` using the template in `agents/WORKLOG_TEMPLATE.md`.
- Immediately update `CONTEXT.md` (under 20 lines) with Current Goal, Last 3 Changes, Next Steps.
- Run `scripts/bump-version.sh [patch|minor|major]` to bump VERSION in `src/config.js` and `src/sw.js`. Mention new version in worklog body.
- Commit message style: Conventional Commits — e.g., `feat(share): add base64 array URL encoding`.

End of blueprint.
