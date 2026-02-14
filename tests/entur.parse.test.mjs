import assert from 'assert/strict';
import { parseEnturResponse } from '../src/entur.js';

console.log('Running entur.parse.test.mjs');
const fakeResponse = {
  data: {
    stopPlace: {
      estimatedCalls: [
        {
          expectedDepartureTime: '2026-02-14T15:10:00Z',
          destinationDisplay: { frontText: 'Central' },
          situations: []
        },
        {
          expectedDepartureTime: '2026-02-14T15:20:00Z',
          destinationDisplay: { frontText: 'Airport' },
          situations: [{ description: [{ value: 'Delay', language: 'no' }] }]
        }
      ]
    }
  }
};

const parsed = parseEnturResponse(fakeResponse);
assert(Array.isArray(parsed), 'parsed should be array');
assert(parsed.length === 2, 'should parse two departures');
assert(parsed[1].situations[0] === 'Delay', 'should extract situation text');

console.log('entur.parse.test.mjs OK');
