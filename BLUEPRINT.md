# Departure Board — BLUEPRINT

## System Goals

A browser-based departure board that replicates the functionality of a terminal departure display. The application fetches real-time transit departure data from an external API, presents it in a compact list format, and allows users to select stations, filter by transport mode, and persist preferences locally.

The application runs entirely in the browser with no server component. If the external API blocks cross-origin requests, the application displays an error state and retains previously fetched data.

Current version: 1.40.26

## High-Level Constraints

- No third-party libraries or packages.
- Client-side only: no server, no proxy, no server-side code in the repository.
- The application must function fully in the browser.
- PWA-capable: installable, offline-cacheable, auto-update capable.
- Accessible and responsive design.
- Supports 12 languages with in-place switching.

## User-Facing Features

- Station selection via text search with autocomplete.
- Favorites list (up to 8 stations) with quick-access dropdown.
- GPS-based nearby stop search using browser geolocation.
- Configurable number of upcoming departures displayed.
- Departure line shows: destination, line number, transport mode, realtime status, scheduled vs actual time, platform/quay, and active situations.
- Realtime indicator: solid dot (live), hollow dot (scheduled), red dot (delayed beyond configurable threshold).
- Cancelled departures shown with strikethrough and reduced opacity.
- Live countdown timer updating every second.
- Pull-to-load-more gesture to progressively load additional departures.
- Settings persisted to local storage: station, departure count, transport modes, text size, fetch interval.
- Language and theme persisted to local storage.
- Shareable board configuration encoded as a compact URL parameter.
- Installable as a PWA with background update notifications.

## Component Hierarchy

### Presentation Layer

- **Board Container** — root element that holds all visual components.
- **Header** — station name (clickable to open favorites dropdown), favorite toggle button, GPS compass button, OSM map button, status chip showing time until next refresh.
- **Departure List** — scrollable list of departure items, each containing destination, line number, transport mode, realtime indicator, countdown, platform symbol, and situation alerts.
- **Action Bar** — share button, theme toggle, settings button.
- **Options Panel** — slide-in panel for configuring station search, transport modes, text size, fetch interval. Contains sub-components: station autocomplete, mode filter grid, language switcher, panel lifecycle controls.
- **Footer** — fixed bottom element with attribution link.
- **Share Button** — button that copies the shareable URL to clipboard, with a fallback URL display box when clipboard access fails.
- **Status Messages** — ephemeral messages for settings confirmation and PWA update prompts. Implemented inline within the options panel lifecycle and the service worker updater.
- **GPS Dropdown** — temporary dropdown listing nearby stops found via geolocation.

### Application Logic Layer

- **Settings Persistence** — loads and saves application settings to local storage. Two modules manage the same storage key: one for global bootstrap state (`src/app/settings.js`) and one for the options panel (`src/ui/options/settings-store.js`). Applies text size to the root element.
- **URL Import** — decodes shared board configuration from URL parameters, applies settings, and cleans the URL.
- **Render Engine** — clears and populates the departure list. Maintains references to text nodes for efficient countdown updates.
- **Fetch Loop** — unified interval that drives departure countdowns and triggers API refreshes. Tracks elapsed time to avoid drift. Handles page visibility changes to detect stale data after OS sleep.
- **Handler Registry** — dispatches user actions: station selection, GPS station selection, favorite toggle, settings apply, language change. Resets progressive load state on station or settings change.
- **Progressive Loader** — handles pull-to-load-more gesture detection, Fibonacci-based count progression, and threshold-based load triggering.
- **Service Worker Updater** — registers the service worker, monitors for updates, displays countdown toast, triggers reload on update activation.

### Data Access Layer

- **API Client Facade** — public entry point for all external data operations.
- **Mode Mapper** — canonicalizes transport mode tokens from raw API responses into a consistent internal representation. Uses recursive scan for nested mode fields.
- **Response Parser** — transforms raw API response into normalized departure objects. Selects situation text by language priority.
- **Query Builder** — constructs GraphQL queries with multiple variant forms for API compatibility. Tries variants in sequence until one succeeds.
- **HTTP Transport** — handles network requests with content-type detection. Abort support is provided by the caller (geocoder) using AbortController, not at the transport layer.
- **Departure Fetcher** — orchestrates the query, transport, and parsing pipeline. Applies client-side mode filtering with recursive raw scan fallback.
- **Geocoder** — station search via autocomplete API with client-side relevance scoring. Filters results by venue type.
- **GPS Search** — reverse geocoding to find nearby stops. Returns results sorted by distance.

### Internationalisation Layer

- **Translation Store** — runtime state holding the current language and a translation lookup function. Falls back to English for missing keys.
- **Translation Strings** — static keyed string map for all 12 supported languages. Every key exists in every language.
- **Language Metadata** — static list of supported languages with code, flag, and display name.
- **Browser Detector** — reads the browser's language preference and maps it to a supported language code.

### Time Utilities

- Pure functions for converting ISO timestamps to epoch milliseconds and formatting countdown durations (MM:SS or HH:MM:SS).

### Configuration

- All configurable constants in a single module: version, app name, defaults (station, departure count, fetch interval, transport modes, client name, API URL, GitHub URL, coordinates), default favorite, all transport modes list, mode grid layout, realtime indicators, delay threshold, transport mode emojis, UI button emojis, cancellation wrapper, platform symbols and symbol selection rules, departure line template, GPS search parameters (max results, search radius), GPS dropdown item template, favorites dropdown item template, station dropdown arrow symbols, scroll-more tuning parameters (scroll steps, pull threshold, wheel threshold, debounce, symbols).

## Data Flow

1. The application reads persisted settings from local storage, then checks URL parameters for a shared board configuration.
2. On start and at each configured interval, the application calls the departure fetcher with the current station ID, count, and selected modes.
3. The departure fetcher uses the query builder to construct a GraphQL query, sends it via the HTTP transport, and passes the response to the parser.
4. The parser returns normalized departure objects. The fetcher applies client-side mode filtering.
5. The render engine clears the departure list and builds new DOM nodes for each departure. A computeDiff utility exists in the codebase but is not used in the render path.
6. A separate countdown ticker updates display values every second without re-fetching.
7. On fetch failure, the application shows an error state and retains previously fetched data if available.

## State Management

### Application State

- **Settings** — station name, station ID, departure count, selected transport modes, text size, fetch interval, latitude, longitude. Persisted to local storage.
- **Language** — current locale code. Persisted to local storage.
- **Theme** — light, auto (system preference), or dark. Persisted to local storage.
- **Favorites** — ordered list of saved stations stored as a single unified list. Each entry has name, ID, modes, and coordinates. The list is ordered by recency and truncated to the configured maximum. Persisted to local storage.
- **Departure Data** — last successfully fetched departure array. Used as fallback on network failure during the next fetch cycle.
- **Progressive Load Count** — temporary count used by the pull-to-load-more feature. Resets on station change, settings change, or reload.

### State Mutations

- Settings, language, theme, and favorites are mutated through dedicated manager functions that validate input before writing.
- Departure data is replaced atomically on successful fetch. Partial updates are not applied.
- Progressive load count is incremented by the handler registry on successful progressive loads and reset on station or settings changes.

## Contracts

### Entry Points

- The application entry point is the HTML document, which loads a single bootstrap module.
- The bootstrap module initializes the language system, theme, DOM structure, and starts the fetch loop.
- The service worker is the PWA entry point, handling cache installation and fetch routing.

### Departure Payload Schema

Each normalized departure object contains:

- `destination` (string) — destination display name.
- `publicCode` (string) — line or route number.
- `expectedDepartureISO` (string, ISO 8601) — expected departure time.
- `aimedDepartureISO` (string, ISO 8601) — scheduled departure time.
- `actualDepartureISO` (string, ISO 8601 or null) — actual departure time if available.
- `realtime` (boolean) — whether the departure time is based on live data.
- `cancellation` (boolean) — whether the departure is cancelled.
- `predictionInaccurate` (boolean) — whether the prediction should be treated as unreliable.
- `mode` (string) — canonical transport mode identifier.
- `quay` (object) — platform/quay information with `id` and `publicCode`.
- `situations` (array) — list of active service situations.
- `raw` (object) — the original API response fragment for debugging.

### Situation Payload Schema

Each situation contains:

- `summary` (object) — with `value` (string) and `language` (string).
- `description` (object) — with `value` (string) and `language` (string).

### Error Boundaries

- **Station lookup failure** — display empty/error state. Retain previous data if available.
- **Network failure** — display error state. Retain previous data if available. Update status chip with retry countdown.
- **API response parse failure** — treat as network failure. Do not crash the application.
- **Geolocation permission denied** — display error message. Do not block other functionality.
- **Service worker update failure** — log warning. Do not block application startup.

### Shared URL Contract

- Encoding: compact JSON array `[stationName, stopId, modes[], latitude, longitude]` (5 elements).
- Encoding steps: JSON stringify, base64 encode, URL-safe character substitution.
- URL parameter: `?b=<encoded>`. Legacy `?board=<encoded>` supported for backward compatibility.
- Decoding detects array vs object format and supports legacy 7-element array and legacy object formats.
- Opening a shared link applies settings, saves to local storage, sets as current station (does not add to favorites), then clears the URL parameter.

### Geocoder Response Contract

- Autocomplete returns a list of venue results. Each result has `name`, `id`, and `coordinates` (latitude, longitude). The full API response is available as `raw`.
- GPS reverse search returns a list of nearby stops. Each result has `name`, `id`, `distance` (kilometers as float), `coordinates`, and `modes` (array of mode objects).

## Persistence

### Storage Schemas

**Settings** — JSON object with keys: station name, station ID, departure count, transport modes (array), text size (enum), fetch interval (integer milliseconds), latitude (float or null), longitude (float or null).

**Language** — string value matching a supported BCP-47 language code.

**Theme** — string value: `light`, `auto`, or `dark`.

**Favorites** — JSON array of station objects stored as a single unified list. Each object contains: name, ID, modes (array), latitude (float), longitude (float), departure count, text size, fetch interval. Ordered by recency. Truncated to the configured maximum (8).

### Storage Keys

Each schema is stored under a key in persistent client storage:

| Key                  | Schema                               |
| -------------------- | ------------------------------------ |
| `departure:settings` | Settings JSON object                 |
| `departure:language` | Language string (BCP-47)             |
| `kollektiv-theme`    | Theme string (`light`/`auto`/`dark`) |
| `recent-stations`    | Favorites JSON array                 |

## External Dependencies

### Entur API

- **Station Autocomplete** — GET request to the geocoder autocomplete endpoint. Query parameter: search text. Response: list of venue results. CORS supported from the application domain.
- **GPS Nearby Stops** — GET request to the geocoder reverse endpoint. Query parameters: latitude, longitude, result count, search radius, layer filter, country filter. Response: GeoJSON FeatureCollection of nearby stops.
- **Departures** — POST request to the GraphQL endpoint. Body: GraphQL query with stop place ID, number of departures, and whitelisted modes. Response: departure data with realtime predictions, platform info, and service situations.
- **Headers** — client name header set to the application identifier.

### OpenStreetMap

- External link opened in a new tab. Uses the current station's coordinates. No API key required. No data stored.

### Browser APIs

- **Geolocation** — optional. Requested only when the user activates the GPS search feature. Permission denied or unavailable results in an error message.
- **Service Worker** — required for PWA functionality (offline cache, push updates). Registration failure is non-fatal; the application continues as a standard web page.
- **Local Storage** — required for settings persistence. If unavailable, the application displays a warning and operates without persistence.
- **Media Query Listener** — used for automatic theme detection based on system preference.

### No External Dependencies

- No third-party libraries, frameworks, fonts, or icon packs.
- No analytics, tracking, or advertising services.

## Time Handling

- All timestamps are stored and compared as UTC epoch milliseconds.
- ISO 8601 strings from the API are parsed to epoch milliseconds.
- Countdown display is computed as the difference between current time and departure time.
- Display format: MM:SS for departures within 60 minutes, HH:MM:SS for longer departures.
- Past departures display as "Now".

## Styling Architecture

- A single entry stylesheet acts as an import manifest. All rules live in separate component files.
- Design tokens (colors, spacing, z-index, transitions) are defined as variables in a dedicated file.
- Theme support is implemented via variable overrides applied to the root element.
- Text sizes are applied as class names on the root element, with component styles scaling accordingly.
- Each component has a dedicated stylesheet following the Single Responsibility Principle.

## Security & Privacy

- No secrets, tokens, or API keys are embedded in the code.
- No user data is logged. Console output uses `warn` for recoverable failures and `error` for unexpected errors.
- All external API calls use the browser's native fetch with abort support.
- Shared URLs contain only station identifiers and user-selected settings. No personal data is encoded.

## Testing Strategy

- Unit tests run in a headless environment using a built-in assertion library.
- Tests are placed in a dedicated test directory.
- Tests are hermetic: no DOM APIs, no network calls. External dependencies are injected as test doubles.
- A single test runner imports all test modules and reports pass/fail.
