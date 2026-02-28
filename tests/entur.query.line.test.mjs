import assert from 'assert/strict';
import { fetchDepartures } from '../src/entur/index.js';

console.log('Running entur.query.line.test.mjs');

let captured = null;
const mockFetch = async (url, opts)=>{
  captured = { url, opts, body: opts && opts.body ? opts.body : null };
  return { ok: true, json: async ()=> ({ data: { stopPlace: { estimatedCalls: [] } } }), headers: { get: ()=>'application/json' } };
};

await fetchDepartures({ stopId: 'S', numDepartures: 3, modes: ['BUS','TRAM'], apiUrl: 'http://fake', clientName: 'test', fetchFn: mockFetch });
assert(captured && captured.body, 'request body should be present');
const bodyObj = JSON.parse(captured.body);
const q = bodyObj.query;
assert(typeof q === 'string', 'query should be a string');
// check that the extended selection requested journeyPattern.line.publicCode and transportMode
assert(/journeyPattern\s*\{\s*\n\s*line\s*\{\s*publicCode\s*transportMode\s*\}/.test(q), 'query should request journeyPattern.line.publicCode and transportMode');

console.log('entur.query.line.test.mjs OK');
