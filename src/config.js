export const DEFAULTS = {
  STATION_NAME: 'Jernbanetorget',
  STOP_ID: null, // When set, skip lookup and use this ID directly
  NUM_DEPARTURES: 2,
  FETCH_INTERVAL: 60,
  TRANSPORT_MODES: ['bus','tram','metro','rail','water','air','coach','gondola','funicular'],
  CLIENT_NAME: 'personal-js-app'
  ,API_URL: 'https://api.entur.io/journey-planner/v3/graphql'
};
