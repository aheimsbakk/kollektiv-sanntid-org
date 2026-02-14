# Departure Board — BLUEPRINT

Purpose
- Browser single‑page application that replicates the terminal departure board in `departure.sh`.
- No external dependencies, no build step. All source lives under `src/` and uses native ES modules + modern browser APIs.

High-level constraints
- No third‑party libraries or packages.
- Files under `src/`.
- Client-side only: no server component, no proxy, and no server instructions included in the repo.
- The app must function fully in the browser. If Entur's API blocks cross-origin requests, the app will fall back
  to a demo/offline mode and a manual JSON upload path so users can load their own fetched data.
- Keep accessibility and responsive design in mind.
- Follow agent protocol before committing: create `agent/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` and update `agent/CONTEXT.md` (<=20 lines).

User-facing features
- Station header (toggleable).
- Up to N upcoming departures (configurable).
- Destination shown prominently (large, "figlet-like" styling via CSS).
- Live countdown (HH:MM:SS or MM:SS), updates every second.
- Situation/service alerts highlighted (red badge / banner).
- Auto-centering both horizontally and vertically.
- Settings persisted to `localStorage` (station name, N, modes, color mode, fetch interval).
- No external fonts required — use system fonts + CSS for visual effect.

Architecture overview
- index.html — entry point, minimal markup, loads `src/app.js` as module.
- src/
  - index.html
  - src/style.css
  - src/app.js            — bootstraps app, wires DOM & intervals
  - src/config.js         — default configurable constants (station, N, interval)
  - src/entur.js          — small Entur GraphQL client (fetch wrapper)
  - src/time.js           — pure utilities: iso → epoch, format countdown
  - src/ui/
    - ui.js               — DOM helpers and render loop (minimize DOM thrash)
    - departure.js        — component to render a single departure
    - header.js           — station header component
  - src/icons.css         — small CSS-only icons/badges if needed
  - src/demo.json         — small test data file for offline dev (optional)
- No transpilation. Use `type="module"` for the scripts.

Data flow
- app.js reads config, initializes UI, then:
  1. On start and every FETCH_INTERVAL seconds: call `entur.fetchDepartures(station, n, modes)`.
  2. `entur.fetchDepartures` uses `fetch()` to hit Entur GraphQL endpoint with the same query used in `departure.sh`.
  3. Parse response to normalized JS objects:
     - { destination: string, expectedDepartureISO: string, situations: [string], raw: {} }
  4. UI layer keeps last successful dataset; on new data diff (by id/time) update DOM nodes for departures; always update countdown labels every second with a small timer that modifies textContent only.
  5. On fetch failure show "Station Not Found" or "Loading..." states similar to terminal script.

Entur API considerations
- Query: use GraphQL `stopPlace(id: "...") { estimatedCalls(numberOfDepartures: X, whiteListedModes: [...]) { expectedDepartureTime destinationDisplay { frontText } situations { description { value language } } } }`
- Use `fetch` with POST, JSON body: `{ "query": "..." }`, and header `ET-Client-Name: personal-js-app`.
- CORS: Because this is a strict client-only application, the app will attempt to call Entur directly from the browser. If Entur blocks cross-origin requests, the app MUST NOT attempt to create or recommend any server-side proxies in the repo. Instead, the app will:
  1. Detect CORS failure and show a clear explanatory message to the user.
  2. Offer a demo/offline mode using bundled `src/demo.json` data.
  3. Provide a manual "Upload JSON" control that accepts a saved Entur response so users can load live data they fetched separately.
  4. Optionally, provide instructions in the UI explaining why requests might fail and how to obtain data (for advanced users) but without shipping server code.

Time and timezone
- Parse ISO times using `Date.parse()`; prefer working in UTC epoch seconds then compute diff with `Date.now()`.
- Display "Now" for diff <= 0.
- Formatting: if hours>0 use `HH:MM:SS`, else `MM:SS`.
- Avoid heavy libraries: use small helper functions in `src/time.js`.

UI/UX & styling
- CSS variables (root): `--bg`, `--fg`, `--accent`, `--danger`, `--mono`, `--large-scale`.
- Use a dark-ish gradient background with subtle texture (pure CSS).
- Destination: large block using monospace font and heavy `font-size` + `text-shadow` to emulate figlet. Provide a CSS "stroke" via multiple `text-shadow` layers for punchy look.
- Time: large bold block under destination.
- Situations: red banner/badge centered above or below the destination when present; show only when non-empty.
- Auto-centering: wrapper uses Flexbox column + `justify-content:center; align-items:center; min-height:100vh;`.
- Responsive: small screens reduce font-size and stack elements; ensure vertical centering still works.
- Accessibility: high contrast, ARIA labels for dynamic content, `role="status"` for countdowns.

Performance & DOM update pattern
- Render template once per departure item; keep references to text nodes for countdown and situation.
- Only update the countdown text every second rather than re-paint full DOM.
- On new fetch, diff the departure array by stable key (destination + expectedDepartureISO) and only add/remove or reorder DOM nodes as needed.
- Use `requestAnimationFrame` sparingly for animations; timer uses `setInterval(1000)` to update times.

Error handling & fallback UX
- If station lookup fails: show "Station Not Found" screen and a retry button.
- If network error: show toast with retry suggestion, and keep previous data if available.
- Provide manual “Refresh” button and keyboard shortcut (e.g., `r`).
- Provide toggle to hide header (parity with `-H`), and toggle for color mode (parity with `-C`).

Settings & persistence
- Settings stored in `localStorage` as `departure.settings` JSON.
- Settings UI either in a small overlay (click gear) or via URL params for quick testing: `?station=...&n=3`.

Testing & dev workflow (no deps)
- Manual smoke tests:
  - Load `index.html`, confirm station lookup, departures, countdowns decrement.
  - Simulate network failure using devtools offline.
  - Simulate situations by editing `src/demo.json` and toggling demo mode.

- Node-local unit tests (recommended):
  - Purpose: provide fast, repeatable tests for pure JS logic that can run locally with Node.js (no browser required).
  - Scope: test pure utilities and parsing logic (e.g. `src/time.js`, `src/entur.js` parsing functions, `src/data-loader.js` normalization).
  - Implementation:
    - Place tests under `tests/` as ESM modules (e.g. `tests/time.test.mjs`, `tests/entur.parse.test.mjs`). The repo already uses ESM (`package.json` includes `type: "module"`).
    - Use Node's built-in `assert` API for assertions (no test framework dependency):
      ```js
      import assert from 'assert';
      import { formatCountdown } from '../src/time.js';

      assert.equal(formatCountdown(65), '01:05');
      ```
    - Provide a tiny test runner `tests/run.mjs` that imports test modules, runs them, logs results, and exits with non-zero code on failure. Example run: `node tests/run.mjs`.
    - Keep tests hermetic: avoid DOM APIs or `fetch`. For functions that interact with the DOM, export pure helpers that can be tested under Node; keep UI integration tested manually in the browser.
  - Automation: recommend adding a convenience `npm` script (optional) — the blueprint avoids auto-generated files, but example command to add locally:
    ```bash
    # run tests locally
    node tests/run.mjs
    # or via npm (if you add a script):
    npm test
    ```

- Browser integration tests (optional):
  - Keep simple manual HTML pages under `tests/` that load modules in a real browser and print assertions to console; these are complementary to Node tests and useful for quick visual verification.

- Logging: minimal console logs guarded by `DEBUG` flag.

Security & privacy
- Never log tokens or secrets. Avoid embedding keys in the code.
- Explain CORS fallback without suggesting public proxies for production.

Files to create (exact file tree)
- `src/index.html`
- `src/style.css`
- `src/app.js`
- `src/config.js`
- `src/entur.js`
- `src/time.js`
- `src/ui/ui.js`
- `src/ui/departure.js`
- `src/ui/header.js`
- `src/icons.css`
- `src/data-loader.js`       # handles manual JSON upload and demo toggle
- `src/demo.json` (bundled demo dataset for offline/dev)

Implementation milestones (priority order)
1. Scaffolding: `index.html`, `style.css`, `src/app.js`, `src/config.js`.
2. Entur client: `src/entur.js` — implement GraphQL query & parse logic; include demo data mode.
3. UI primitives: `src/ui/ui.js`, `src/ui/header.js`, `src/ui/departure.js`.
4. Time utilities and countdown timer: `src/time.js`.
5. Settings persistence and controls.
6. Accessibility polish and responsive tweaks.
7. Error handling, offline/demo mode, and manual testing pages.
8. Prepare release: `agent/worklogs/...` entry and `agent/CONTEXT.md` update before commit.

Commit & agent protocol notes (required)
- Before committing any code, create a granular worklog file: `agent/worklogs/YYYY-MM-DD-HH-mm-create-blueprint.md` containing ONLY the front-matter keys below followed by 1–3 sentence body describing changes and files touched.
  - Example front matter:
    ```yaml
    ---
    when: 2026-02-14T12:00:00Z
    why: create blueprint for pure-js departure board
    what: add BLUEPRINT.md content and implementation plan
    model: github-copilot/gpt-5-mini
    tags: [blueprint, planning, departure]
    ---
    ```
- Immediately update `agent/CONTEXT.md` (under 20 lines) with Current Goal, Last 3 Changes, Next Steps.
- If any file contains `VERSION="x.y.z"`, bump semver and mention it in worklog body.
- Commit message style: Conventional — e.g., `feat(ui): add blueprint and scaffolding plan`.

Estimate & deliverables
- Blueprint approval (this file).
- After approval: implement scaffolding (1–2 hours manual coding).
- Full implementation and polish (4–8 hours depending on styling/edge cases).

Open questions (pick one)
- Should the app attempt a pure client-side approach first (try `fetch` to Entur and handle CORS errors), or do you prefer we plan for a small local proxy from the start? (Recommended: try client-only first; add proxy only if necessary.)

End of blueprint.
