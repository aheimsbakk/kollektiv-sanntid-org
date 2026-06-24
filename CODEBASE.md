# Departure Board — CODEBASE

## Specs

- **Languages:** JavaScript (ES modules, no transpilation), CSS, HTML
- **Framework:** None (vanilla browser APIs)
- **Dependency Manager:** npm (`package-lock.json`)
- **Node type:** `"type": "module"` in `package.json`
- **Dev dependencies:** `prettier@3.5.3`
- **Naming conventions:**
  - Files and directories: `kebab-case` (e.g. `fetch-loop.js`, `scroll-more.css`)
  - JavaScript exports: `camelCase` (e.g. `createDepartureNode`, `buildVariants`)
  - CSS classes: `kebab-case` with BEM-like scoping (e.g. `.departure-destination`, `.options-panel`)
  - Constants: `UPPER_SNAKE_CASE` (e.g. `DEFAULTS`, `GPS_MAX_RESULTS`)
  - LocalStorage keys: `kebab-case` with namespace prefix (e.g. `departure:settings`, `kollektiv-theme`)

## Language Rationale

- **Vanilla JavaScript (no framework)** — the app is a single departure board with no complex state management, routing, or server-side rendering. A framework would add unnecessary bundle size and complexity. ES modules are native in all supported browsers, eliminating the need for a bundler.
- **No transpilation** — targets modern browsers (Chrome 102+, Firefox 112+, Safari 15.5+) that support ES2020+ natively (optional chaining, nullish coalescing, dynamic import). No Babel or transpilation step is needed.
- **CSS custom properties for theming** — CSS variables enable runtime theme switching (light/auto/dark) without a preprocessor or JS-based style injection. Theme overrides apply to `:root` and cascade automatically.
- **`"type": "module"` in package.json** — allows source files (`.js`) and test files (`.mjs`) to use ESM syntax. Test files use the `.mjs` extension to mark the Node.js-only boundary explicitly.
- **Service worker as a separate file** — required by the Service Worker specification (separate scope, separate origin path). The SW uses a versioned cache key imported from `src/config.js` to keep cache and app version in sync.
- **No build step** — source files are served directly. This simplifies development and deployment (no bundler, no source maps, no artifacts). The trade-off (no tree-shaking or minification) is acceptable for a <50 KB app.

## Entry Points

| Entry          | Path                       | Role                                                                                       |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| HTML           | `src/index.html`           | Root document; loads `src/app.js` as module                                                |
| App bootstrap  | `src/app.js`               | Initializes language, theme, board DOM, handlers, scroll-more, SW registration, fetch loop |
| CSS manifest   | `src/style.css`            | `@import` manifest; rules live in `src/css/*.css`                                          |
| Service worker | `src/sw.js`                | Versioned cache, fetch routing, skipWaiting                                                |
| PWA manifest   | `src/manifest.webmanifest` | Installable PWA config                                                                     |
| Test runner    | `tests/run.mjs`            | Node ESM test runner (imports all `*.test.mjs` files)                                      |

## Directory Structure

```
work/
├── AGENTS.md                          # Master rules & workflow
├── BLUEPRINT.md                       # Architecture specification (language-agnostic)
├── CHANGELOG.md                       # Version history
├── CONTEXT.md                         # Session context (<=20 lines)
├── CNAME                              # Domain: kollektiv.sanntid.org
├── REPORT.md                          # Worklog retrospective report
├── README.md                          # User-facing documentation
├── opencode.json                      # OpenCode IDE configuration
├── package.json                       # npm manifest (dev deps: prettier)
├── package-lock.json                  # Locked dependency tree
├── .gitignore                         # Excluded paths
├── .githooks/                         # Git hooks directory
├── .opencode/                         # OpenCode configuration & skills
│   ├── RULES.md                       # Project rules (conflict resolution, security, etc.)
│   └── skills/                        # Skill definitions
├── departure.sh                       # Original terminal departure board (reference)
├── docs/                              # Documentation
│   ├── entur-apis/                    # Entur API reference docs
│   ├── openstreetmap/                 # OSM integration docs
│   ├── pwa/                           # PWA/service worker docs
│   ├── share_url_encoding.md          # Share URL base64 encoding spec
│   ├── PROJECT_RULES.md               # Project-specific rules
│   └── worklogs/                      # Per-session worklog files
├── scripts/                           # Utility scripts
│   ├── bump-version.sh                # Bump VERSION in config.js + sw.js
│   ├── fix_worklogs.sh                # Worklog maintenance
│   ├── serve-src.sh                   # Local dev server
│   └── validate_worklogs.sh           # Worklog validation
├── src/                               # Application source
│   ├── index.html                     # Entry point HTML
│   ├── app.js                         # Bootstrap: imports, wires DOMContentLoaded, BFCache teardown
│   ├── config.js                      # All constants: VERSION, DEFAULTS, MODE_GRID, REALTIME_INDICATORS, DELAY_THRESHOLD_MS, TRANSPORT_MODE_EMOJIS, UI_EMOJIS, PLATFORM_SYMBOLS, PLATFORM_SYMBOL_RULES, DEPARTURE_LINE_TEMPLATE, GPS_MAX_RESULTS, SCROLL_MORE, etc.
│   ├── time.js                        # Pure utilities: isoToEpochMs, formatCountdown
│   ├── i18n.js                        # Backward-compat shim → re-exports from i18n/index.js
│   ├── style.css                      # CSS @import manifest (no rules)
│   ├── icons.css                      # CSS-only icon/badge helpers
│   ├── sitemap.xml                    # SEO sitemap
│   ├── sw.js                          # Service worker: versioned cache, fetch routing, skipWaiting
│   ├── manifest.webmanifest           # PWA manifest (icons, display, theme)
│   ├── app/                           # Application logic modules
│   │   ├── settings.js                # localStorage load/save, applyTextSize
│   │   ├── url-import.js              # Decode ?b=/ ?board= params, clean URL
│   │   ├── render.js                  # renderDepartures (clear + populate list)
│   │   ├── fetch-loop.js              # doRefresh, startRefreshLoop, tickCountdowns, visibilitychange wake-up
│   │   ├── handlers.js                # handleStationSelect, handleGpsStationSelect, handleFavoriteToggle, onApplySettings, onLanguageChange
│   │   ├── action-bar.js              # Share + theme + settings buttons, settings-bar container
│   │   ├── gps-bar.js                 # GPS bar builder: compass + OSM button, share button placement
│   │   ├── scroll-more.js             # Pull-to-load-more: Fibonacci progression, gesture detection, debounce
│   │   └── sw-updater.js              # SW registration, update toast, controllerchange + fallback reload
│   ├── entur/                         # Entur API client modules
│   │   ├── index.js                   # Public facade: exports parseEnturResponse, fetchDepartures, lookupStopId, searchStations, fetchNearbyStops
│   │   ├── modes.js                   # CANONICAL_MODE_MAP, mapTokenToCanonical, extractString, detectModeFromRaw
│   │   ├── parser.js                  # parseEnturResponse (pure function, language-priority situation text)
│   │   ├── query.js                   # buildQuery, buildVariants (14 GraphQL query variant forms)
│   │   ├── http.js                    # getContentType, postAndParse (network transport)
│   │   ├── departures.js              # fetchDepartures orchestration + client-side mode filter
│   │   ├── geocoder.js                # lookupStopId, searchStations (relevance scoring, AbortController)
│   │   └── gps-search.js              # fetchNearbyStops, extractModes, CATEGORY_TO_MODE
│   ├── i18n/                          # Internationalisation modules
│   │   ├── index.js                   # Public facade: re-exports from store.js
│   │   ├── store.js                   # Runtime state: currentLanguage, t(), setLanguage(), initLanguage(), getLanguages()
│   │   ├── translations.js            # Static 12-language string map
│   │   ├── languages.js               # Static metadata: code/flag/name (12 entries)
│   │   └── detect.js                  # detectBrowserLanguage() (pure, maps nb/nn → no)
│   ├── css/                           # Component stylesheets
│   │   ├── tokens.css                 # CSS custom properties: colors, spacing, z-index, transitions
│   │   ├── base.css                   # Browser reset (html, body, *)
│   │   ├── buttons.css                # Button system: base, .header-btn, .btn-action
│   │   ├── layout.css                 # Page skeleton: .app-root, .board, body.options-open
│   │   ├── utils.css                  # A11y helpers: .visually-hidden
│   │   ├── header.css                 # Station header, dropdown, status chip, favorite btn
│   │   ├── toolbar.css                # Fixed top-right .settings-bar, top-left .gps-bar
│   │   ├── departures.css             # Departure list, destination, time, platform, text-size-*
│   │   ├── scroll-more.css            # Pull-to-load indicator: ▼ arrow, ● max, .scroll-more-indicator--triggered
│   │   ├── options-panel.css          # Slide-in panel shell, .options-row, .options-actions
│   │   ├── autocomplete.css           # Station search autocomplete list
│   │   ├── transport-modes.css        # Mode filter checkbox grid
│   │   ├── language-switcher.css      # Flag button row
│   │   ├── share-modal.css            # Share URL overlay
│   │   ├── toasts.css                 # .options-toast, #sw-update-toast
│   │   ├── gps-dropdown.css           # GPS nearby-stops dropdown
│   │   ├── footer.css                 # Fixed bottom-left .app-footer
│   │   └── debug.css                  # .debug-panel (dev-only)
│   ├── icons/                         # PWA icon assets
│   │   ├── favicon.svg                # Browser favicon
│   │   ├── icon-192.svg               # PWA icon 192x192
│   │   ├── icon-192-maskable.svg      # PWA maskable icon 192x192
│   │   ├── icon-512.svg               # PWA icon 512x512
│   │   └── icon-512-maskable.svg      # PWA maskable icon 512x512
│   └── ui/                            # UI component modules
│       ├── ui.js                      # createBoardElements, updateFavoriteButton, clearList, findKey, computeDiff
│       ├── departure.js               # isDepartureDelayed, createDepartureNode, updateDepartureCountdown
│       ├── header.js                  # createHeaderToggle (minimal wrapper)
│       ├── options.js                 # Re-export shim → ./options/index.js
│       ├── share-button.js            # encodeSettings, decodeSettings, createShareButton
│       ├── station-dropdown.js        # getRecentStations, getDefaultStation, addRecentStation, removeFromFavorites, isStationInFavorites, modesEqual, createStationDropdown
│       ├── theme-toggle.js            # createThemeToggle, initTheme, getTheme (kollektiv-theme key)
│       ├── osm-button.js              # buildOsmUrl (pure), createOsmButton
│       ├── mode-utils.js              # emojiForMode, labelForMode (shared across modules)
│       ├── footer.js                  # createFooter, updateFooterTranslations
│       ├── gps-dropdown.js            # createGpsButton (compass + dropdown, geolocation, destroy)
│       └── options/                   # Options panel sub-modules
│           ├── index.js               # createOptionsPanel orchestrator (assemble, change tracking)
│           ├── settings-store.js      # loadSettings, saveSettings, validateOptions, diffOptions
│           ├── transport-modes.js     # createModesSection (checkbox table, toggle-all, debounced apply)
│           ├── station-autocomplete.js # createStationAutocomplete (debounced search, keyboard nav, blur auto-select, _explicitSelection)
│           ├── language-switcher.js   # createLanguageSwitcher (flag buttons, updateTranslations)
│           └── panel-lifecycle.js     # createPanelLifecycle (open/close, focus trap, ESC, toast)
├── tests/                             # Unit tests (Node ESM, no DOM/fetch)
│   ├── run.mjs                        # Test runner: imports all *.test.mjs, handles unhandledRejection
│   ├── time.test.mjs                  # Time utility tests
│   ├── fetch-loop.test.mjs            # Fetch loop tick tests
│   ├── ui.tick.test.mjs               # Countdown tick tests
│   ├── ui.diff.test.mjs               # computeDiff tests
│   ├── ui.emoji.test.mjs              # Emoji mapping tests
│   ├── ui.emoji.rawtest.mjs           # Raw emoji tests
│   ├── i18n.test.mjs                  # i18n translation tests
│   ├── share-button-reset.test.mjs    # Share button reset tests
│   ├── share-link.test.mjs            # Share link encoding/decoding tests
│   ├── share-gps.test.mjs             # Share link GPS coordinate tests
│   ├── favorites.test.mjs             # Favorites CRUD tests
│   ├── favorites-gps.test.mjs         # Favorites GPS coordinate tests
│   ├── remove-favorites.test.mjs      # Remove favorites tests
│   ├── station-dropdown.test.mjs      # Station dropdown tests
│   ├── toggle-all.test.mjs            # Transport mode toggle-all tests
│   ├── footer-link.test.mjs           # Footer link tests
│   ├── osm-button.test.mjs            # OSM button tests
│   ├── sw.test.mjs                    # Service worker tests
│   ├── sw-api-caching.test.mjs        # SW API caching tests
│   ├── sw-updater.test.mjs            # SW updater tests
│   ├── entur.parse.test.mjs           # Entur response parser tests
│   ├── entur.parse.mode.test.mjs      # Mode parsing tests
│   ├── entur.modes.test.mjs           # Mode mapping tests
│   ├── entur.query.line.test.mjs      # Query builder tests
│   ├── entur.empty.test.mjs           # Empty response tests
│   ├── entur.fetch.test.mjs           # Fetch orchestration tests
│   ├── entur.lookup.test.mjs          # Stop ID lookup tests
│   ├── entur.norwegian.chars.test.mjs # Norwegian character handling tests
│   ├── entur.norwegian.real.test.mjs  # Real Norwegian data tests
│   ├── entur.autocomplete.blindern.test.mjs # Blindern autocomplete tests
│   ├── entur.storen.autocomplete.test.mjs # Storen autocomplete tests
│   ├── entur.gps-nearby.test.mjs      # GPS nearby stops tests
│   ├── autocomplete-blur-race.test.mjs # Autocomplete blur race condition tests
│   ├── autocomplete-first-load.test.mjs # Autocomplete first load tests
│   ├── autocomplete-input-wipe.test.mjs # Autocomplete input-wipe guard tests
│   ├── departure-delay.test.mjs       # Departure delay detection tests
│   ├── options-autocomplete.test.mjs  # Options panel autocomplete tests
│   ├── search-filtering.test.mjs      # Station search filtering tests
│   └── gps-dropdown-click.test.mjs    # GPS dropdown click delegation tests
└── .github/                           # (No workflows per AGENTS.md constraints)
```

## Physical Path Mappings (Blueprint → Codebase)

### Core

| Blueprint Component | Physical Path    |
| ------------------- | ---------------- |
| Entry point         | `src/index.html` |
| Bootstrap           | `src/app.js`     |
| Configuration       | `src/config.js`  |
| Time utilities      | `src/time.js`    |

### Application Logic (`src/app/`)

| Blueprint Component        | Physical Path            |
| -------------------------- | ------------------------ |
| Settings persistence       | `src/app/settings.js`    |
| URL import (share links)   | `src/app/url-import.js`  |
| Departure rendering        | `src/app/render.js`      |
| Fetch loop + countdown     | `src/app/fetch-loop.js`  |
| User action handlers       | `src/app/handlers.js`    |
| Global action bar          | `src/app/action-bar.js`  |
| GPS action bar             | `src/app/gps-bar.js`     |
| Scroll-more (pull-to-load) | `src/app/scroll-more.js` |
| Service worker updater     | `src/app/sw-updater.js`  |

### Entur API Client (`src/entur/`)

| Blueprint Component       | Physical Path             |
| ------------------------- | ------------------------- |
| Public facade             | `src/entur/index.js`      |
| Mode mapping              | `src/entur/modes.js`      |
| Response parser           | `src/entur/parser.js`     |
| Query builder             | `src/entur/query.js`      |
| HTTP transport            | `src/entur/http.js`       |
| Departure fetch           | `src/entur/departures.js` |
| Geocoder (station search) | `src/entur/geocoder.js`   |
| GPS search                | `src/entur/gps-search.js` |

### Internationalisation (`src/i18n/`)

| Blueprint Component  | Physical Path              |
| -------------------- | -------------------------- |
| Public facade        | `src/i18n/index.js`        |
| Language store       | `src/i18n/store.js`        |
| Translation strings  | `src/i18n/translations.js` |
| Language metadata    | `src/i18n/languages.js`    |
| Browser detection    | `src/i18n/detect.js`       |
| Backward-compat shim | `src/i18n.js`              |

### UI Components (`src/ui/`)

| Blueprint Component       | Physical Path                            |
| ------------------------- | ---------------------------------------- |
| Board element factory     | `src/ui/ui.js`                           |
| Departure component       | `src/ui/departure.js`                    |
| Header controls           | `src/ui/header.js`                       |
| Options panel shim        | `src/ui/options.js`                      |
| Share button              | `src/ui/share-button.js`                 |
| Station dropdown          | `src/ui/station-dropdown.js`             |
| Theme toggle              | `src/ui/theme-toggle.js`                 |
| OSM map button            | `src/ui/osm-button.js`                   |
| Mode utilities            | `src/ui/mode-utils.js`                   |
| Footer                    | `src/ui/footer.js`                       |
| GPS dropdown              | `src/ui/gps-dropdown.js`                 |
| Options orchestrator      | `src/ui/options/index.js`                |
| Options settings store    | `src/ui/options/settings-store.js`       |
| Options transport modes   | `src/ui/options/transport-modes.js`      |
| Options autocomplete      | `src/ui/options/station-autocomplete.js` |
| Options language switcher | `src/ui/options/language-switcher.js`    |
| Options panel lifecycle   | `src/ui/options/panel-lifecycle.js`      |

### Styles (`src/css/`)

| Blueprint Component      | Physical Path                   |
| ------------------------ | ------------------------------- |
| CSS entry manifest       | `src/style.css`                 |
| Icon helpers             | `src/icons.css`                 |
| Design tokens            | `src/css/tokens.css`            |
| Browser reset            | `src/css/base.css`              |
| Button system            | `src/css/buttons.css`           |
| Page layout              | `src/css/layout.css`            |
| A11y utilities           | `src/css/utils.css`             |
| Header styles            | `src/css/header.css`            |
| Toolbar styles           | `src/css/toolbar.css`           |
| Departure styles         | `src/css/departures.css`        |
| Scroll-more styles       | `src/css/scroll-more.css`       |
| Options panel styles     | `src/css/options-panel.css`     |
| Autocomplete styles      | `src/css/autocomplete.css`      |
| Transport modes styles   | `src/css/transport-modes.css`   |
| Language switcher styles | `src/css/language-switcher.css` |
| Share modal styles       | `src/css/share-modal.css`       |
| Toast styles             | `src/css/toasts.css`            |
| GPS dropdown styles      | `src/css/gps-dropdown.css`      |
| Footer styles            | `src/css/footer.css`            |
| Debug styles             | `src/css/debug.css`             |

### PWA Assets

| Blueprint Component | Physical Path                     |
| ------------------- | --------------------------------- |
| Service worker      | `src/sw.js`                       |
| PWA manifest        | `src/manifest.webmanifest`        |
| Favicon             | `src/icons/favicon.svg`           |
| Icon 192            | `src/icons/icon-192.svg`          |
| Icon 192 maskable   | `src/icons/icon-192-maskable.svg` |
| Icon 512            | `src/icons/icon-512.svg`          |
| Icon 512 maskable   | `src/icons/icon-512-maskable.svg` |
| Sitemap             | `src/sitemap.xml`                 |

### Tests (`tests/`)

| Blueprint Component               | Physical Path                                |
| --------------------------------- | -------------------------------------------- |
| Test runner                       | `tests/run.mjs`                              |
| Time tests                        | `tests/time.test.mjs`                        |
| Fetch loop tests                  | `tests/fetch-loop.test.mjs`                  |
| UI tick tests                     | `tests/ui.tick.test.mjs`                     |
| UI diff tests                     | `tests/ui.diff.test.mjs`                     |
| UI emoji tests                    | `tests/ui.emoji.test.mjs`                    |
| UI emoji raw tests                | `tests/ui.emoji.rawtest.mjs`                 |
| i18n tests                        | `tests/i18n.test.mjs`                        |
| Share button tests                | `tests/share-button-reset.test.mjs`          |
| Share link tests                  | `tests/share-link.test.mjs`                  |
| Share GPS tests                   | `tests/share-gps.test.mjs`                   |
| Favorites tests                   | `tests/favorites.test.mjs`                   |
| Favorites GPS tests               | `tests/favorites-gps.test.mjs`               |
| Remove favorites tests            | `tests/remove-favorites.test.mjs`            |
| Station dropdown tests            | `tests/station-dropdown.test.mjs`            |
| Toggle-all tests                  | `tests/toggle-all.test.mjs`                  |
| Footer link tests                 | `tests/footer-link.test.mjs`                 |
| OSM button tests                  | `tests/osm-button.test.mjs`                  |
| SW tests                          | `tests/sw.test.mjs`                          |
| SW API caching tests              | `tests/sw-api-caching.test.mjs`              |
| SW updater tests                  | `tests/sw-updater.test.mjs`                  |
| Entur parser tests                | `tests/entur.parse.test.mjs`                 |
| Entur parse mode tests            | `tests/entur.parse.mode.test.mjs`            |
| Entur modes tests                 | `tests/entur.modes.test.mjs`                 |
| Entur query tests                 | `tests/entur.query.line.test.mjs`            |
| Entur empty tests                 | `tests/entur.empty.test.mjs`                 |
| Entur fetch tests                 | `tests/entur.fetch.test.mjs`                 |
| Entur lookup tests                | `tests/entur.lookup.test.mjs`                |
| Entur Norwegian chars tests       | `tests/entur.norwegian.chars.test.mjs`       |
| Entur Norwegian real tests        | `tests/entur.norwegian.real.test.mjs`        |
| Entur Blindern autocomplete tests | `tests/entur.autocomplete.blindern.test.mjs` |
| Entur Storen autocomplete tests   | `tests/entur.storen.autocomplete.test.mjs`   |
| Entur GPS nearby tests            | `tests/entur.gps-nearby.test.mjs`            |
| Autocomplete blur race tests      | `tests/autocomplete-blur-race.test.mjs`      |
| Autocomplete first load tests     | `tests/autocomplete-first-load.test.mjs`     |
| Autocomplete input-wipe tests     | `tests/autocomplete-input-wipe.test.mjs`     |
| Departure delay tests             | `tests/departure-delay.test.mjs`             |
| Options autocomplete tests        | `tests/options-autocomplete.test.mjs`        |
| Search filtering tests            | `tests/search-filtering.test.mjs`            |
| GPS dropdown click tests          | `tests/gps-dropdown-click.test.mjs`          |

### Scripts (`scripts/`)

| Blueprint Component | Physical Path                  |
| ------------------- | ------------------------------ |
| Version bump        | `scripts/bump-version.sh`      |
| Fix worklogs        | `scripts/fix_worklogs.sh`      |
| Serve source        | `scripts/serve-src.sh`         |
| Validate worklogs   | `scripts/validate_worklogs.sh` |

### Documentation (`docs/`)

| Blueprint Component | Physical Path                |
| ------------------- | ---------------------------- |
| Entur API docs      | `docs/entur-apis/`           |
| OSM docs            | `docs/openstreetmap/`        |
| PWA docs            | `docs/pwa/`                  |
| Share URL encoding  | `docs/share_url_encoding.md` |
| Project rules       | `docs/PROJECT_RULES.md`      |
| Worklogs            | `docs/worklogs/`             |

## Dependency Graph (Module Imports)

```
src/app.js
├── src/config.js
├── src/i18n.js → src/i18n/index.js → src/i18n/store.js
│   ├── src/i18n/translations.js
│   ├── src/i18n/languages.js
│   └── src/i18n/detect.js
├── src/ui/theme-toggle.js
├── src/ui/ui.js
│   ├── src/i18n.js
│   ├── src/config.js
│   ├── src/ui/station-dropdown.js
│   │   ├── src/i18n.js
│   │   ├── src/config.js
│   │   ├── src/ui/share-button.js
│   │   │   ├── src/i18n.js
│   │   │   └── src/config.js
│   │   └── src/ui/mode-utils.js
│   │       └── src/config.js
│   └── src/ui/footer.js
│       ├── src/i18n.js
│       └── src/config.js
├── src/ui/header.js
├── src/ui/options/index.js
│   ├── src/i18n.js
│   ├── src/config.js
│   ├── src/ui/options/settings-store.js
│   ├── src/ui/options/transport-modes.js
│   │   ├── src/config.js
│   │   └── src/ui/mode-utils.js
│   ├── src/ui/options/station-autocomplete.js
│   │   └── src/entur/index.js
│   ├── src/ui/options/language-switcher.js
│   │   └── src/i18n.js
│   └── src/ui/options/panel-lifecycle.js
│       └── src/i18n.js
├── src/app/settings.js
├── src/app/url-import.js
│   ├── src/config.js
│   ├── src/i18n.js
│   ├── src/ui/share-button.js
│   └── src/app/settings.js
├── src/app/render.js
│   ├── src/time.js
│   ├── src/ui/ui.js
│   ├── src/ui/departure.js
│   │   ├── src/config.js
│   │   └── src/ui/mode-utils.js
│   └── src/i18n.js
├── src/app/fetch-loop.js
│   ├── src/config.js
│   ├── src/entur/index.js
│   ├── src/time.js
│   ├── src/i18n.js
│   └── src/app/render.js
├── src/app/handlers.js
│   ├── src/config.js
│   ├── src/i18n.js
│   ├── src/ui/ui.js
│   ├── src/ui/station-dropdown.js
│   ├── src/app/settings.js
│   └── src/app/fetch-loop.js
├── src/app/action-bar.js
│   ├── src/config.js
│   ├── src/i18n.js
│   ├── src/ui/share-button.js
│   ├── src/ui/theme-toggle.js
│   └── src/ui/ui.js
├── src/app/gps-bar.js
│   ├── src/ui/gps-dropdown.js
│   │   ├── src/entur/gps-search.js
│   │   ├── src/config.js
│   │   └── src/i18n.js
│   └── src/ui/osm-button.js
│       ├── src/config.js
│       └── src/i18n.js
├── src/app/sw-updater.js
│   ├── src/config.js
│   └── src/i18n.js
└── src/app/scroll-more.js
    ├── src/config.js
    └── src/i18n.js

src/entur/index.js
├── src/entur/parser.js
│   └── src/entur/modes.js
├── src/entur/departures.js
│   ├── src/entur/query.js
│   ├── src/entur/http.js
│   └── src/entur/parser.js
├── src/entur/geocoder.js
│   └── src/entur/http.js
└── src/entur/gps-search.js
    └── src/config.js
```

## LocalStorage Keys

| Key                  | Value Type                     | Managed By                                                          |
| -------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `departure:settings` | JSON object                    | `src/app/settings.js` (loadSettings/saveSettings)                   |
| `departure:language` | string (BCP-47 code)           | `src/i18n/store.js` (setLanguage)                                   |
| `kollektiv-theme`    | string (`light`/`auto`/`dark`) | `src/ui/theme-toggle.js`                                            |
| `recent-stations`    | JSON array                     | `src/ui/station-dropdown.js` (addRecentStation/removeFromFavorites) |

## Version Tracking

| File            | Key          | Current Value   |
| --------------- | ------------ | --------------- |
| `src/config.js` | `VERSION`    | `'1.40.26'`     |
| `src/sw.js`     | `VERSION`    | `'1.40.26'`     |
| `package.json`  | `version`    | `'1.40.26'`     |
| `CHANGELOG.md`  | latest entry | version history |
