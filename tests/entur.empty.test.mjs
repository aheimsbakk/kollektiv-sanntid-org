import assert from 'assert/strict';
import { fetchDepartures } from '../src/entur.js';

console.log('Running entur.empty.test.mjs');

let called = false;
const mockFetch = async (url, opts)=>{
  called = true;
  // Respond with a valid GraphQL envelope but no estimatedCalls
  return { ok: true, json: async ()=> ({ data: { stopPlace: { estimatedCalls: [] } } }), headers: { get: (k)=> 'application/json' } };
};

const results = await fetchDepartures({stopId:'X', apiUrl:'http://fake', fetchFn: mockFetch});
assert(called, 'fetch should be called');
assert(Array.isArray(results) && results.length===0, 'should return empty array for no departures');

console.log('entur.empty.test.mjs OK');
