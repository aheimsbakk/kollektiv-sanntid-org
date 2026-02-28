import assert from 'assert/strict';
import { parseEnturResponse } from '../src/entur/index.js';

console.log('Running entur.parse.mode.test.mjs');

const fakeResponse = {
  data: {
    stopPlace: {
      estimatedCalls: [
        {
          expectedDepartureTime: '2026-02-15T01:00:00Z',
          destinationDisplay: { frontText: 'Central' },
          situations: [],
          serviceJourney: {
            journeyPattern: { line: { transportMode: 'BUS', publicCode: '31' } }
          }
        },
        {
          expectedDepartureTime: '2026-02-15T01:05:00Z',
          destinationDisplay: { frontText: 'Harbor' },
          situations: [],
          serviceJourney: {
            journeyPattern: { line: { transportMode: 'TRAM', publicCode: '12' } }
          }
        }
      ]
    }
  }
};

const parsed = parseEnturResponse(fakeResponse);
assert(Array.isArray(parsed), 'parsed should be array');
assert(parsed.length === 2, 'should parse two departures');
assert(parsed[0].mode === 'bus', 'first item should have normalized mode "bus"');
assert(parsed[1].mode === 'tram', 'second item should have normalized mode "tram"');

console.log('entur.parse.mode.test.mjs OK');
