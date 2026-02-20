// Version is defined here and in src/sw.js (service worker)
// Both must be kept in sync - use scripts/bump-version.sh to update both
export const VERSION = '1.27.11';

export const DEFAULTS = {
  STATION_NAME: 'Jernbanetorget, Oslo',
  STOP_ID: null, // When set, skip lookup and use this ID directly
  NUM_DEPARTURES: 5,
  FETCH_INTERVAL: 60,
  TRANSPORT_MODES: ['bus','tram','metro','rail','water','coach'],
  CLIENT_NAME: 'kollektiv-sanntid-org',
  API_URL: 'https://api.entur.io/journey-planner/v3/graphql'
};

// Immutable list of all transport modes for fallback when no modes are selected
export const ALL_TRANSPORT_MODES = ['bus','tram','metro','rail','water','coach'];

// Realtime data indicators
// Used in the departure line template via {indicator} placeholder
export const REALTIME_INDICATORS = {
  realtime: '●',    // Solid dot for live realtime data
  scheduled: '○'    // Hollow dot for scheduled/static data
};

// Transport mode emojis
// Used to visually identify the type of transport in departures and UI
export const TRANSPORT_MODE_EMOJIS = {
  bus: '🚌',
  tram: '🚋',
  metro: '🚇',
  rail: '🚅',
  water: '🛳️',
  coach: '🚍',
  default: '🚆'  // Fallback for unknown transport types
};

// UI Button emojis
export const UI_EMOJIS = {
  settings: '⚙️',
  share: '📋',
  shareSuccess: '✓',
  themeLight: '🌞',
  themeAuto: '🌤️',
  themeDark: '🌥️'
};

// Cancellation display wrapper
// When a departure is cancelled (item.cancellation === true), the entire
// departure line will be wrapped with these HTML tags to apply strikethrough styling.
// The styling is defined in CSS via .departure-cancelled class.
export const CANCELLATION_WRAPPER = {
  open: '<span class="departure-cancelled">',
  close: '</span>'
};

// Platform/Quay display symbols - based on the type of stop location
// We detect the type from the quay publicCode format:
// - Numeric (1-20) = Platform (trains, metro)
// - Letters (A-Z) = Gate/Stop (buses, trams)
export const PLATFORM_SYMBOLS = {
  platform: '⚏',  // Railroad track symbol for numbered platforms (trains, metro)
  gate: '◆',      // Diamond for lettered gates (buses at stations)
  stop: '▪',      // Small square for lettered stops (trams, local buses)
  berth: '⚓',     // Anchor for ferry berths
  default: '•'    // Bullet for unknown/ambiguous cases
};

// Departure line display template
// Available placeholders:
//   {lineNumber}   - Line/route number (e.g., "L2", "81")
//   {destination}  - Destination name (e.g., "Ski", "Myrvoll stasjon")
//   {emoji}        - Transport mode emoji (e.g., 🚅, 🚌, 🚇)
//   {platform}     - Platform/gate display (stacked symbol+code)
//   {indicator}    - Realtime indicator (● for live data, ○ for scheduled)
//
// Template examples:
//   '{lineNumber} · {destination} {emoji}{platform}'       - Line first (old format)
//   '{destination} {indicator} {lineNumber} {emoji}{platform}' - Destination first with realtime indicator
//   '{destination} {emoji}{platform} ({lineNumber})'       - Line in parentheses
//   '{emoji} {lineNumber} - {destination}{platform}'       - Emoji first
//
// Note: {platform} is automatically empty if no platform info is available
export const DEPARTURE_LINE_TEMPLATE = '{destination} {indicator} {lineNumber} {emoji} {platform}';
