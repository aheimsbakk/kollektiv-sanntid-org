/**
 * fetch-loop.guard.test.mjs
 *
 * Regression tests for the doRefresh generation guard:
 *  - a fetch response that was in flight during a station/settings change
 *    must NOT render, and exactly one follow-up refresh must run with the
 *    current settings (the board must end on the NEW station's data).
 *
 * Exercises the real module: global fetch and document are stubbed, and
 * node:timers is used so a fake global.setTimeout from another suite cannot
 * interfere with the waits here.
 */
import assert from 'assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import { DEFAULTS } from '../src/config.js';
import { doRefresh, invalidateRender, data } from '../src/app/fetch-loop.js';

console.log('Running fetch-loop.guard.test.mjs');

// ── stubs (installed unconditionally, restored at the end) ─────────────────
// Earlier suites leave their own `document` stubs in place, and those lack the
// members createDepartureNode needs — install a complete stub and restore the
// previous one when done so later suites see what they expect.
const prevDocument = globalThis.document;
globalThis.document = {
  createElement: (tag) => ({
    tag,
    style: {},
    dataset: {},
    children: [],
    setAttribute() {},
    getAttribute: () => null,
    removeAttribute() {},
    set textContent(v) {
      this._text = v;
    },
    get textContent() {
      return this._text;
    },
    append(...n) {
      this.children.push(...n);
    },
  }),
};

function makeListEl() {
  return {
    children: [],
    get firstChild() {
      return this.children[0] || null;
    },
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    removeChild(n) {
      const i = this.children.indexOf(n);
      if (i >= 0) this.children.splice(i, 1);
      return n;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function payloadFor(destination) {
  return {
    data: {
      stopPlace: {
        estimatedCalls: [
          {
            expectedDepartureTime: new Date(Date.now() + 60_000).toISOString(),
            destinationDisplay: { frontText: destination },
            situations: [],
          },
        ],
      },
    },
  };
}

const prevFetch = globalThis.fetch;
const prevStopId = DEFAULTS.STOP_ID;

let fetchCalls = 0;
globalThis.fetch = async () => {
  fetchCalls += 1;
  const destination = fetchCalls === 1 ? 'StaleStation' : 'FreshStation';
  if (fetchCalls === 1) await sleep(30); // slow response for the old station
  return { json: async () => payloadFor(destination) };
};

// ── scenario: station switch while a fetch is in flight ────────────────────
DEFAULTS.STOP_ID = 'NSR:StopPlace:test'; // skip the geocoder lookup path
const listEl = makeListEl();

const first = doRefresh(listEl); // fetch #1 starts for the old station
invalidateRender(); // simulate the station/settings change mid-flight
await first; // fetch #1 lands, guard discards it, queues fetch #2
await sleep(40); // let the queued refresh complete

assert.equal(fetchCalls, 2, 'stale response must trigger exactly one queued refresh');
assert.equal(data.length, 1, 'board data should hold one departure');
assert.equal(
  data[0].destination,
  'FreshStation',
  'stale response must not replace board data — expected the re-fetch result'
);
assert.equal(listEl.children.length, 1, 'the fresh departure must be rendered once');

// ── restore globals so later suites see untouched state ────────────────────
globalThis.fetch = prevFetch;
globalThis.document = prevDocument;
DEFAULTS.STOP_ID = prevStopId;

console.log('fetch-loop.guard.test.mjs OK');
