import assert from 'assert/strict';
import { parseEnturResponse } from '../src/entur/index.js';

console.log('Running entur.parse.test.mjs');

const multiLangSituation = {
  description: [
    { value: 'Forsinkelse', language: 'no' },
    { value: 'Delay', language: 'en' },
    { value: 'Verspätung', language: 'de' },
  ],
};

const fakeResponse = {
  data: {
    stopPlace: {
      estimatedCalls: [
        {
          expectedDepartureTime: '2026-02-14T15:10:00Z',
          destinationDisplay: { frontText: 'Central' },
          situations: [],
        },
        {
          expectedDepartureTime: '2026-02-14T15:20:00Z',
          destinationDisplay: { frontText: 'Airport' },
          situations: [multiLangSituation],
        },
      ],
    },
  },
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
  data: {
    stopPlace: {
      estimatedCalls: [
        {
          expectedDepartureTime: '2026-02-14T15:10:00Z',
          destinationDisplay: { frontText: 'X' },
          situations: [noEnSituation],
        },
      ],
    },
  },
};
const parsedEs = parseEnturResponse(noEnResponse, 'es');
assert.equal(
  parsedEs[0].situations[0],
  'Forsinkelse',
  'should fall back to first entry when lang and en both missing'
);

// --- Merged situation strings: summary (heading) + description (detail) ---

const mergeCases = [
  {
    name: 'summary first, then description',
    situation: {
      summary: [
        { value: 'Buss for T-bane', language: 'no' },
        { value: 'Bus replacement', language: 'en' },
      ],
      description: [
        { value: 'Gjelder linje 1.', language: 'no' },
        { value: 'Applies to line 1.', language: 'en' },
      ],
    },
    lang: 'en',
    expected: 'Bus replacement. Applies to line 1.',
  },
  {
    name: 'summary ending with period is not terminated twice',
    situation: {
      summary: [{ value: 'Bus replacement.', language: 'en' }],
      description: [{ value: 'Applies to line 1.', language: 'en' }],
    },
    lang: 'en',
    expected: 'Bus replacement. Applies to line 1.',
  },
  {
    name: 'identical summary and description render once',
    situation: {
      summary: [{ value: 'Delay', language: 'en' }],
      description: [{ value: 'Delay', language: 'en' }],
    },
    lang: 'en',
    expected: 'Delay',
  },
  {
    name: 'summary without description gets a period appended',
    situation: { summary: [{ value: 'Delay', language: 'en' }] },
    lang: 'en',
    expected: 'Delay.',
  },
  {
    name: 'summary with trailing whitespace still gets a period',
    situation: {
      summary: [{ value: 'Delay ', language: 'en' }],
      description: [{ value: 'On line 1.', language: 'en' }],
    },
    lang: 'en',
    expected: 'Delay. On line 1.',
  },
  {
    name: 'description only renders alone',
    situation: { description: [{ value: 'Applies to line 1.', language: 'en' }] },
    lang: 'en',
    expected: 'Applies to line 1.',
  },
];

for (const c of mergeCases) {
  const resp = {
    data: {
      stopPlace: {
        estimatedCalls: [
          {
            expectedDepartureTime: '2026-02-14T15:10:00Z',
            destinationDisplay: { frontText: 'X' },
            situations: [c.situation],
          },
        ],
      },
    },
  };
  const parsed = parseEnturResponse(resp, c.lang);
  assert.equal(parsed[0].situations[0], c.expected, `merged situations: ${c.name}`);
}

console.log('entur.parse.test.mjs OK');
