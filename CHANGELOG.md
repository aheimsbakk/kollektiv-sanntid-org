# Changelog

## [1.40.27] - 2026-06-24

- **why:** Transport mode labels scrambled after language change
- **model:** opencode/deepseek-v4-flash
- **tags:** fix, i18n, ui, language-switcher

### Fixed

- Transport mode checkbox labels no longer scrambled when switching language — `updateTranslations` in `language-switcher.js` now reads each checkbox value for the translation key instead of using a hardcoded index array that didn't match the `MODE_GRID` layout order
- Added `tests/transport-mode-labels.test.mjs` to verify grid layout and value-based label mapping

## [1.40.26] - 2026-04-24

- **why:** Plain language improvements to README
- **model:** claude-sonnet-4.6
- **tags:** docs, readme, plain-language

### Changed

- Renamed "About" to "How it works" and "Updates" to "App Updates"
- Merged duplicate GPS and map feature descriptions into Getting Started
- Added live app URL, Run Locally section, and Contributing section

## [1.40] - 2026-03-17 to 2026-04-23

- **why:** Add OpenStreetMap button, GPS coordinate persistence, OSM status UX, and UI polish
- **model:** claude-sonnet-4.6
- **tags:** feat, osm, gps, fix, config, css, icons

### Added

- OpenStreetMap button to GPS bar with coordinate propagation and WGS 84 bounds validation
- Station dropdown arrow symbols configurable via `STATION_DROPDOWN` in `config.js`

### Fixed

- Persist LAT/LON across settings changes, keyboard station select, and share-link reload
- Restore GPS coordinates from favorites unconditionally on startup
- Fix coordinate restore guard to use strict null check for value 0
- Show no-coords toast, clear stale lat/lon on re-type, pass coords through validateOptions
- Replace auto-timeout dismiss with click-outside dismiss for OSM no-coords status
- Clamp GPS/OSM status box width to viewport; add width and min-width to prevent collapse
- Stack OSM button below GPS button; match OSM alert box structure to GPS dropdown
- Clean up osm-button.js stale code and correct .osm-status padding
- Add osm-button.js to service worker ASSETS cache list
- Fix station title focus visibility and eliminate first-touch focus ring via four WebKit edge-case fixes
- Suppress touch tap highlight and restrict focus ring to keyboard navigation across all interactive elements
- Add console.warn to silent catch blocks for observability

### Changed

- Move share button to top-left GPS bar, map button below compass
- Centralize delayed indicator symbol in `REALTIME_INDICATORS.delayed` config key
- Update delayed departure indicator to diamond symbol (◆)
- Replace KS with bus stop emoji (🚏), add maskable icons, update manifest and service worker

## [1.39] - 2026-03-16

- **why:** Add red dot delay indicator for late realtime departures
- **model:** claude-sonnet-4.6
- **tags:** feat, departure, realtime

### Added

- Red dot delay indicator for late realtime departures with configurable threshold
- Delay threshold raised from 60s to 120s for meaningful delay detection
- Unit tests for departure delay detection

## [1.38] - 2026-03-13 to 2026-03-16

- **why:** Resolve ANALYZE.md compliance issues and improve toolbar layout
- **model:** claude-sonnet-4.6
- **tags:** refactor, a11y, hygiene, analysis

### Fixed

- Resolve 11 High/Medium severity issues from ANALYZE.md compliance audit
- Fix race conditions in refresh loop, resource leaks, and crash vectors
- Replace alert() with non-blocking error helper in share-button.js
- Fix autocomplete input-wipe guard and GPS stopsMap regression
- Add console.warn to silent catch blocks for observability

### Changed

- Split global-gear into settings-bar and share-bar for correct z-ordering
- Standardize dropdown styling and keyboard interaction across GPS, favorites, autocomplete
- Enforce tab order: GPS, share, theme, settings, heart, station, footer links

### Added

- ANALYZE.md with full rules compliance audit
- Footer module extracted from ui.js (SRP)
- Mode-utils module consolidating emoji-for-mode logic

## [1.37] - 2026-03-10 to 2026-03-12

- **why:** Add pull-to-load-more scroll gesture with extensive mobile fixes
- **model:** claude-sonnet-4.6
- **tags:** feat, scroll, mobile, pwa

### Added

- Pull-to-load-more scroll gesture with Fibonacci step sequence (18, 36, 54, ...)
- Configurable SCROLL_MORE object with pull threshold, resistance, and wheel settings
- Ease-out-cubic rAF bounce-back animation on release
- Prettier 3.5.3 as dev dependency

### Fixed

- Chrome mobile address bar color and FOUC via inline theme script
- Firefox scroll choppiness with scoped touch-action during pull gesture
- Footer overlap on Firefox with isolation and min-height fixes
- Bounce-back animation stalls replaced with CSS transitions
- Ghost mousedown suppression and leading-edge debounce for load triggers

## [1.36] - 2026-03-04 to 2026-03-06

- **why:** Add GPS nearby-stop search with compass button
- **model:** claude-sonnet-4.6
- **tags:** feat, gps, i18n, memory

### Added

- GPS nearby-stop search with compass button and Entur Geocoder reverse API
- Full i18n support for GPS in all locales
- Localized locality suffix display in autocomplete dropdown
- GPS/favorites dropdown limits reduced to 8 items

### Fixed

- Eliminate memory leaks: listener accumulation, stale async callbacks, fetch races
- Replace innerHTML with createElement for XSS prevention
- Replace deprecated escape/unescape with TextEncoder/TextDecoder

### Changed

- Move MODE_GRID from transport-modes.js to config.js
- Refactor default station handling with pure function

## [1.35] - 2026-03-03 to 2026-03-04

- **why:** Polish favorite heart UX and fix options panel number inputs
- **model:** claude-sonnet-4.6
- **tags:** ux, config, fix

### Changed

- Simplify favorite heart to gray/red states, drop theme-split logic

### Added

- Configurable footer emojis and correct GitHub anchor URL
- Footer link and readme emoji keys in UI_EMOJIS config

### Fixed

- Apply changes on blur for mobile Chrome number inputs in options panel

## [1.34] - 2026-03-01 to 2026-03-02

- **why:** Add SEO, favorites toggle, and PWA reliability improvements
- **model:** claude-sonnet-4.6
- **tags:** feat, seo, pwa, favorites

### Added

- Remove-from-favorites toggle on heart button
- SEO meta tags and rel="me" GitHub link
- Dynamic theme-color meta tag sync with THEME_COLORS
- Sitemap.xml with lastmod automation
- Visibilitychange wake-up refresh and BFCache guard

### Fixed

- SW update race using controllerchange event
- SW updater Firefox bug with unified countdown timer
- Stale cache on update with Request cache bypass
- URL-import conflict with optional field initialization
- Unified fetch/countdown loop into single 1-second interval

## [1.33] - 2026-02-28 to 2026-03-01

- **why:** Resolve memory leaks and add data attribution
- **model:** claude-sonnet-4.6
- **tags:** fix, memory, i18n, footer

### Added

- Translated "Data from Entur" attribution line in footer
- pickLocalised() helper for situation text fallback chain

### Fixed

- Resolve 9 memory leak patterns across 8 UI components
- Add named destroy() methods for proper resource cleanup

## [1.31] - 2026-02-27 to 2026-02-28

- **why:** Decompose monolithic modules into focused sub-modules
- **model:** claude-sonnet-4.6
- **tags:** refactor, i18n, app, entur, ui, css, sw

### Changed

- Split entur.js (678 lines) into 6 modules under src/entur/
- Split app.js (550 lines) into 7 modules under src/app/
- Split options.js (651 lines) into 6 modules under src/ui/options/
- Split i18n.js (951 lines) into 5 modules under src/i18n/
- Split style.css (847 lines) into 16 component files under src/css/

### Fixed

- Add i18n module paths to service worker ASSETS list
- Replace SW_ACTIVATED postMessage with controllerchange event

## [1.30] - 2026-02-24 to 2026-02-26

- **why:** Localize countdown labels and harden CI workflows
- **model:** claude-sonnet-4.6
- **tags:** feat, i18n, ci, refactor

### Added

- Localize "Now" countdown label across all 12 languages
- Configurable GITHUB_URL for footer link
- PR preview garbage collection workflow

### Changed

- Rules-compliance refactor of entur.js, app.js, and all src/ui/\* modules

## [1.29] - 2026-02-20

- **why:** Restore station pre-fill and add SW caching tests
- **model:** claude-sonnet-4.6
- **tags:** feat, test

### Added

- Restore station name pre-fill on focus for better UX
- Service worker API caching test to prevent regression

## [1.28] - 2026-02-20

- **why:** Clean up debug logging
- **model:** claude-sonnet-4.6
- **tags:** fix, hygiene

### Fixed

- Remove debug logging from searchStations in entur.js

## [pre-v1.27] - 2026-02-14 to 2026-02-19

- **why:** Initial scaffold and early feature development
- **model:** gpt-5-mini, claude-sonnet-4.5
- **tags:** scaffold, pwa, i18n, ui, accessibility, ci

### Added

- Pure client-side departure board with offline/demo fallback
- Settings persistence to localStorage with ESC-to-close and focus-trap
- PWA installability: web manifest, icons, service worker cache
- Station autocomplete querying Entur geocoder with rate limiting
- Multilingual support: 8 languages (no, en, de, es, it, el, fa, hi) with auto-detection
- Keyboard navigation: sequential Enter flow through options panel
- Theme toggle: light/auto/dark modes cycling button
- Footer with version display and GitHub link
- Unified dropdown styling (grid layout, hover/select states)
- Unified button styles with dark mode prep
- Inline transport emoji in departure destination text
- Client-side filter fallback when Entur rejects mode AST variants
- PR preview deployment system with GitHub Environments and auto-cleanup
- Dynamic dropdown width, auto-select inputs, configurable separators
- Realtime indicator, cancellation styling, platform symbols
- Share button with URL compression, pushState, and favorites integration
- Configurable emojis, configurable GitHub URL, text size persistence

### Fixed

- Data loader Node.js fs compat, demo JSON MIME type, fetch fallback
- SW cache versioning, assets list, update detection, race conditions
- Autocomplete hang, stale results, input stuck, first-load issues
- Norwegian character display, venue stop filtering, storen autocomplete
- Countdown reset, refresh interval handling, immediate updates
- Dropdown hover, vertical centering, tooltip placement and language update
- Missing translations (to, Norwegian/Icelandic terms)
- Demo fallback removal, debug panel cleanup, unused demo files

## [archived] - 2026-02-14

- **why:** Initial project scaffold and first working prototype
- **model:** gpt-5-mini
- **tags:** scaffold, blueprint, demo, tests, entur, emoji, debug

### Added

- BLUEPRINT.md: architecture specification for pure client-side departure board
- Node.js ESM test runner with `node/node` wrapper and `npm test` script
- Static serve script (`scripts/serve-src.sh`) for manual browser testing
- Initial UI scaffold: header, departure rows, options panel, icons
- Data loader with JSON import and demo data for offline development
- Per-departure countdown timer with HH:MM:SS formatting
- Live Entur API integration with `lookupStopId`, retry/fallback, periodic refresh
- Transport emoji detection in departure text with heuristic mapping
- Debug panel with emoji detection diagnostics and raw response dump
- Options panel: checkbox labels, overlay positioning, text size selector
- Demo data timestamp adjustment for always-future offsets

### Fixed

- Data loader `import ... assert` SyntaxError — switched to dynamic import with fetch fallback
- Missing `DEFAULTS.API_URL` causing POST to localhost — added config guard
- GraphQL mode enum uppercased (e.g. TRAM) — maps to lowercase for validation
- JSON responses with `errors` array treated as non-success for alternative query shapes
- Options panel checkbox labels rendering concatenated — added spacing
- Options panel CSS import for fixed positioning overlay
- Body class toggling on panel open/close for overlay behavior
