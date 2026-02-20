// Version is defined here and in src/sw.js (service worker)
// Both must be kept in sync - use scripts/bump-version.sh to update both
export const VERSION = '1.19.0';

export const DEFAULTS = {
  STATION_NAME: 'Jernbanetorget, Oslo',
  STOP_ID: null, // When set, skip lookup and use this ID directly
  NUM_DEPARTURES: 5,
  FETCH_INTERVAL: 60,
  TRANSPORT_MODES: ['bus','tram','metro','rail','water','coach'],
  CLIENT_NAME: 'kollektiv-sanntid-org',
  API_URL: 'https://api.entur.io/journey-planner/v3/graphql'
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
//
// Template examples:
//   '{lineNumber} · {destination} {emoji}{platform}'  - Line first (old format)
//   '{destination} · {lineNumber} {emoji}{platform}'  - Destination first
//   '{destination} {emoji}{platform} ({lineNumber})'  - Line in parentheses
//   '{emoji} {lineNumber} - {destination}{platform}'  - Emoji first
//
// Note: {platform} is automatically empty if no platform info is available
export const DEPARTURE_LINE_TEMPLATE = '{destination} · {lineNumber} {emoji}{platform}';
