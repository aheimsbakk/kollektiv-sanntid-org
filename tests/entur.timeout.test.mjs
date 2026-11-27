/**
 * entur.timeout.test.mjs
 *
 * Regression tests for RULES §12 (bounded network waits):
 *  1. postAndParse aborts a hung request after timeoutMs
 *  2. geocoder searchStations degrades to [] when timed out
 *  3. gps fetchNearbyStops degrades to [] when timed out
 *  4. createTimeoutSignal relays an external abort immediately
 *  5. fetchDepartures stops the 14-variant retry loop after one abort
 */
import assert from 'assert/strict';
import { postAndParse, createTimeoutSignal } from '../src/entur/http.js';
import { searchStations } from '../src/entur/geocoder.js';
import { fetchNearbyStops } from '../src/entur/gps-search.js';
import { fetchDepartures } from '../src/entur/index.js';

console.log('Running entur.timeout.test.mjs');

// Mimics real fetch semantics: the promise rejects with AbortError when the
// signal fires and never settles otherwise.
function hangingFetch(url, opts) {
  return new Promise((resolve, reject) => {
    if (opts && opts.signal) {
      opts.signal.addEventListener('abort', () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        reject(err);
      });
    }
  });
}

// ── 1: postAndParse rejects with AbortError after the timeout ──────────────
{
  await assert.rejects(
    postAndParse('http://fake', 'test-client', hangingFetch, '{ q }', null, 25),
    (err) => err.name === 'AbortError',
    'postAndParse must abort a hung request'
  );
}

// ── 2: searchStations swallows the timeout and returns [] ──────────────────
{
  const results = await searchStations({
    text: 'Blindern',
    fetchFn: hangingFetch,
    timeoutMs: 25,
  });
  assert.deepEqual(results, [], 'searchStations must degrade to empty on timeout');
}

// ── 3: fetchNearbyStops swallows the timeout and returns [] ────────────────
{
  const stops = await fetchNearbyStops({
    lat: 59.91,
    lon: 10.75,
    fetchFn: hangingFetch,
    timeoutMs: 25,
  });
  assert.deepEqual(stops, [], 'fetchNearbyStops must degrade to empty on timeout');
}

// ── 4: external signal aborts the chained signal immediately ───────────────
{
  const ctrl = new AbortController();
  const { signal, done } = createTimeoutSignal(5000, ctrl.signal);
  assert(!signal.aborted, 'chained signal should start un-aborted');
  ctrl.abort();
  assert(signal.aborted, 'external abort must relay to the chained signal');
  done();
}

// ── 5: variant retry loop stops on the first abort ─────────────────────────
{
  let calls = 0;
  const countingHang = (url, opts) => {
    calls += 1;
    return hangingFetch(url, opts);
  };
  await assert.rejects(
    fetchDepartures({ stopId: 'X', apiUrl: 'http://fake', fetchFn: countingHang, timeoutMs: 25 }),
    (err) => err.name === 'AbortError',
    'fetchDepartures must surface the abort'
  );
  assert.equal(calls, 1, 'variant loop must not retry after an abort');
}

console.log('entur.timeout.test.mjs OK');
