import assert from 'assert/strict';
import { lookupStopId } from '../src/entur/index.js';

console.log('Running entur.lookup.test.mjs');

let called = false;
const mockFetch = async (url, opts)=>{
  called = true;
  // Respond with a small valid geocoder payload
  return { ok: true, json: async ()=> ({ features: [ { properties: { id: 'NSR:StopPlace:58366' } } ] }), headers: { get: (k)=> 'application/json' } };
};

const id = await lookupStopId({ stationName: 'Jernbanetorget', fetchFn: mockFetch });
assert(called, 'fetch called');
assert(id === 'NSR:StopPlace:58366', 'expected stop id');

console.log('entur.lookup.test.mjs OK');
