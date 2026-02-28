import assert from 'assert/strict';
import { parseEnturResponse } from '../src/entur/index.js';

console.log('Running entur.parse.test.mjs');

const multiLangSituation = {
  description: [
    { value: 'Forsinkelse', language: 'no' },
    { value: 'Delay',       language: 'en' },
    { value: 'Verspätung',  language: 'de' }
  ]
};

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
          situations: [multiLangSituation]
        }
      ]
    }
  }
};

// Default lang ('en') → should pick English text
const parsedEn = parseEnturResponse(fakeResponse);
assert(Array.isArray(parsedEn), 'parsed should be array');
assert(parsedEn.length === 2, 'should parse two departures');
assert.equal(parsedEn[1].situations[0], 'Delay', 'default lang should pick English');

// lang='no' → should pick Norwegian text
const parsedNo = parseEnturResponse(fakeResponse, 'no');
assert.equal(parsedNo[1].situations[0], 'Forsinkelse', 'lang=no should pick Norwegian');

// lang='de' → should pick German text
const parsedDe = parseEnturResponse(fakeResponse, 'de');
assert.equal(parsedDe[1].situations[0], 'Verspätung', 'lang=de should pick German');

// lang='fr' (not available) → should fall back to English
const parsedFr = parseEnturResponse(fakeResponse, 'fr');
assert.equal(parsedFr[1].situations[0], 'Delay', 'lang=fr should fall back to English');

// lang='es' with no English available → should fall back to first entry
const noEnSituation = { description: [{ value: 'Forsinkelse', language: 'no' }] };
const noEnResponse = {
  data: { stopPlace: { estimatedCalls: [{
    expectedDepartureTime: '2026-02-14T15:10:00Z',
    destinationDisplay: { frontText: 'X' },
    situations: [noEnSituation]
  }] } }
};
const parsedEs = parseEnturResponse(noEnResponse, 'es');
assert.equal(parsedEs[0].situations[0], 'Forsinkelse', 'should fall back to first entry when lang and en both missing');

console.log('entur.parse.test.mjs OK');
