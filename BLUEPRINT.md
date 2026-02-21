# Departure Board — BLUEPRINT (REVISED)

Purpose
- Browser single‑page application that renders a terminal-style departure board using modern browser APIs and native ES modules.
- Pure client-side UX: the app calls Entur endpoints directly from the browser and expects live data; there is no bundled demo fallback in mainline builds.
- Keep UI accessible, responsive and dependency-free (no bundler/transpilation required).

High-level constraints
- No third‑party runtime libraries. Use only native browser APIs and small, testable JS modules under `src/`.
- Client-side only: do not add server proxies or server code in the repo. If Entur or CORS blocks requests the app must show a clear error/empty state and instructions.
- Versioning: `src/config.js` and `src/sw.js` both contain version constants and must be kept in sync; use `scripts/bump-version.sh` when making releases.
- Follow agents/worklog protocol: create `agents/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` and update `agents/CONTEXT.md` before commits.

User-facing features
- Station dropdown (recent favorites) with keyboard navigation and inline mode icons.
- Configurable number of upcoming departures (N).
- Prominent destination display with large monospace-like styling; live countdowns updated each second.
- Situation/service alerts shown when present.
- Settings persisted to `localStorage` (`departure:settings`) and recent stations stored under `recent-stations`.
- Shareable boards via compact base64 array URL `?b=<base64>` using array-encoding (backwards compatible with legacy object format).
- Toggleable options panel (keyboard-friendly, uses `inert` and focus trapping).

Architecture overview (current)
- `index.html` — minimal entry; loads `src/app.js` as module.
- `src/`
  - `src/index.html`
  - `src/style.css`
  - `src/app.js`            — bootstraps the app, wires UI, orchestrates refresh loop, SW registration
  - `src/config.js`         — `VERSION`, `DEFAULTS`, `PLATFORM_SYMBOLS`, `PLATFORM_SYMBOL_RULES`, emojis, storage keys
  - `src/entur.js`          — GraphQL client, `fetchDepartures`, `lookupStopId`, `searchStations`, `parseEnturResponse`
  - `src/time.js`           — time utilities (ISO → epoch, countdown format)
  - `src/sw.js`             — service worker, asset list, network/caching rules
  - `src/ui/`               — UI primitives and components:
    - `ui.js`, `departure.js`, `header.js`, `options.js`, `station-dropdown.js`, `share-button.js`, `theme-toggle.js`, `share-button.js`
  - `src/icons.css`, `src/i18n.js` and other small modules
- No build step; scripts are ESM modules loaded via `type="module"`.

Data flow and Entur client
- Startup: `app.js` loads settings, resolves `STOP_ID` (use `DEFAULTS.STOP_ID` if present, else `lookupStopId`), then calls `fetchDepartures`.
- `fetchDepartures` (in `src/entur.js`) attempts multiple GraphQL shapes/variants (variables vs inline literals, extended selection) to accommodate server AST sensitivity; it parses the response into normalized objects and returns an array of departures.
- When server returns an unfiltered response and the caller requested modes, `fetchDepartures` may apply a permissive client-side filter to align UI with user-selected modes.
- Lightweight in-memory cache: `globalThis._enturCache` keyed by request shape/stopId; `app.js` clears or uses it intentionally.
- `searchStations` queries Entur geocoder and re-ranks results; the UI intentionally avoids restrictive geocoder category filters because of geocoder edge cases in production.

UI/UX & styling
- CSS variables for theme colors and sizes; responsive scaling controlled by `TEXT_SIZE` with CSS classes like `text-size-medium`.
- Destination and countdown use dedicated nodes; countdown updates only modify text content each second (`updateDepartureCountdown`).
- Platform/quay display uses stacked symbol+code; symbol selection is driven from `PLATFORM_SYMBOL_RULES` and `PLATFORM_SYMBOLS` in `src/config.js` (regex + transport mode matching).
- Accessibility: ARIA labels, `role="status"` for dynamic countdowns, keyboard traps, `inert` for hidden panels.

Service worker & caching
- `src/sw.js` contains a version constant and a deterministic `ASSETS` list of local assets to cache.
- Navigation requests are network-first with fallback to cache; local assets are cache-first; external API requests (Entur/geocoder) are network-only and are NOT cached by the SW.
- Update flow: app detects waiting SW, shows a short upgrade notification/countdown, posts `SKIP_WAITING` to the worker and forces a reload with a cache-busting `?t=` param.

Error handling & offline UX
- If a live fetch fails: show a clear "error" status chip and a retry control; keep the last successful dataset where possible.
- The app no longer bundles a demo fallback; manual demo artifacts were removed from mainline to avoid shipping stale test data. For offline/dev needs, consider a separate dev-only demo loader that is not committed to mainline.

Settings & persistence
- Settings saved to `localStorage` under `departure:settings`.
- Recent stations/favorites saved under `recent-stations` with stored `stopId`, modes and optional per-station settings.
- `STOP_ID` can be stored on station selection to skip brittle name lookups for certain edge-case locations.

Testing & dev workflow
- Node-local unit tests (ESM) cover pure logic (time utilities, entur parsing, diff logic, share encode/decode); run via `node tests/run.mjs` or `npm test`.
- Tests avoid DOM or fetch unless mocked; keep UI integration tested manually in a browser.
- Keep `scripts/validate_worklogs.sh` in CI/pre-commit flows to enforce worklog front-matter.

Versioning & commits
- When committing user-visible changes bump the version in both `src/config.js` and `src/sw.js`. Prefer `scripts/bump-version.sh` to do this consistently.
- Before any commit create a worklog `agents/worklogs/YYYY-MM-DD-HH-mm-create-blueprint.md` with the strict front-matter keys (`when`, `why`, `what`, `model`, `tags`) and a 1–3 sentence body; validate with `scripts/validate_worklogs.sh`.
- Commit message style: conventional commits, e.g., `feat(ui): add blueprint and scaffolding plan`.

Files to add/remove (current canonical set)
- Keep: `src/index.html`, `src/style.css`, `src/app.js`, `src/config.js`, `src/entur.js`, `src/time.js`, `src/sw.js`, `src/i18n.js`, `src/ui/*`, `src/icons.css`, `src/manifest.webmanifest`
- Removed from mainline: `src/data-loader.js`, `src/demo.json` (dev/demo loaders may live in a separate branch or dev-only helper not merged to mainline)

Implementation milestones (priority order)
1. Keep scaffolding and tests green: ensure `npm test` passes locally.
2. Update `BLUEPRINT.md` to match this document (this file).
3. If you want dev/demo flow preserved, add a development-only loader behind a build/dev flag (do not ship demo data in production).
4. Continue incremental UI polish: accessibility, platform symbol edge cases, and compact share UX.

Open questions (pick one)
1) Reintroduce an optional dev/demo loader (dev-only, not committed to mainline) to make browser development easier? (Recommended: yes for a separate dev helper; keep it out of the production tree.)
2) Keep live-only policy as the canonical user experience (recommended) or plan an "offline demo" mode in the UI for non-technical users?
3) Should we publish a small CHANGELOG entry listing removal of demo fallback and STOP_ID behavior for transparency?

Next steps (recommended)
1) Apply this blueprint update to `BLUEPRINT.md` and run `npm test` locally; fix any test regressions.
2) If updating the file in the repo, create the required worklog (`agents/worklogs/...`) and update `agents/CONTEXT.md` before committing; then run `scripts/bump-version.sh patch` if you make non-feature changes.
3) Tell me if you want me to apply the revised `BLUEPRINT.md`, create the worklog, run tests, and open a commit — I will prepare the exact changes and a proposed commit message but will not modify the repo until you confirm.
