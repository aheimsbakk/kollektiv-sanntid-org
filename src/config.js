// Version is defined here and in src/sw.js (service worker)
// Both must be kept in sync - use scripts/bump-version.sh to update both
export const VERSION = '1.5.1';

export const DEFAULTS = {
  STATION_NAME: 'Jernbanetorget',
  STOP_ID: null, // When set, skip lookup and use this ID directly
  NUM_DEPARTURES: 2,
  FETCH_INTERVAL: 60,
  TRANSPORT_MODES: ['bus','tram','metro','rail','water','coach'],
  CLIENT_NAME: 'personal-js-app'
  ,API_URL: 'https://api.entur.io/journey-planner/v3/graphql'
};
