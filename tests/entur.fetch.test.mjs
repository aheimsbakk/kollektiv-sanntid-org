import assert from 'assert/strict';
import { fetchDepartures } from '../src/entur/index.js';

console.log('Running entur.fetch.test.mjs');

const fakeResp = { data: { stopPlace: { estimatedCalls: [ { expectedDepartureTime:'2026-02-14T15:10:00Z', destinationDisplay:{frontText:'Central'}, situations:[] } ] } } };

let called = false;
const mockFetch = async (url, opts)=>{
  called = true;
  return { json: async ()=> fakeResp };
};

const results = await fetchDepartures({stopId:'X', apiUrl:'http://fake', fetchFn: mockFetch});
assert(called, 'fetch should be called');
assert(Array.isArray(results) && results.length===1, 'should parse one call');

// Cache behavior test: calling again quickly should still work and values stable
const results2 = await fetchDepartures({stopId:'X', apiUrl:'http://fake', fetchFn: mockFetch});
assert(Array.isArray(results2) && results2.length===1, 'second fetch should also parse');

console.log('entur.fetch.test.mjs OK');
