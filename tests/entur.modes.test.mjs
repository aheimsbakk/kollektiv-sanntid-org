import assert from 'assert/strict';
import { fetchDepartures } from '../src/entur/index.js';

console.log('Running entur.modes.test.mjs');

let captured = null;
const mockFetch = async (url, opts)=>{
  // capture body
  captured = { url, opts, body: opts && opts.body ? opts.body : null };
  // respond with valid JSON
  return { ok: true, json: async ()=> ({ data: { stopPlace: { estimatedCalls: [] } } }), headers: { get: ()=>'application/json' } };
};

// Call with modes set
await fetchDepartures({ stopId: 'S', numDepartures: 2, modes: ['bus','tram'], apiUrl: 'http://fake', clientName: 'test', fetchFn: mockFetch });
assert(captured && captured.body, 'request body should be present');
const bodyObj = JSON.parse(captured.body);
const q = bodyObj.query;
assert(typeof q === 'string', 'query should be a string');
// ensure whiteListedModes appears in query when modes present
assert(/whiteListedModes/.test(q), 'query should contain whiteListedModes');

console.log('entur.modes.test.mjs OK');
