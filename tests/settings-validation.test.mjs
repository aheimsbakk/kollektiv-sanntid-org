/**
 * settings-validation.test.mjs
 *
 * Regression tests for the unified settings validation owner:
 *  - one shared bounds definition (src/app/settings.js) used by both the
 *    bootstrap loader and the options panel validator
 *  - values written by the options panel always survive a reload
 *  - out-of-range stored values are dropped, never trusted
 */
import assert from 'assert/strict';
import { DEFAULTS, ALL_TRANSPORT_MODES } from '../src/config.js';
import {
  loadSettings,
  saveSettings,
  clampNumber,
  SETTINGS_BOUNDS,
  DEFAULT_TEXT_SIZE,
} from '../src/app/settings.js';
import { validateOptions, diffOptions } from '../src/ui/options/settings-store.js';

console.log('Running settings-validation.test.mjs');

// ── localStorage stub (installed unconditionally, restored at the end) ─────
const prevLocalStorage = globalThis.localStorage;
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

// Snapshot DEFAULTS so the suite leaves the singleton as it found it.
const snapshot = JSON.parse(JSON.stringify(DEFAULTS));

// ── clampNumber follows the shared bounds ──────────────────────────────────
assert.equal(clampNumber(300, SETTINGS_BOUNDS.NUM_DEPARTURES, 5), 50, 'clamps above max');
assert.equal(clampNumber(-5, SETTINGS_BOUNDS.NUM_DEPARTURES, 5), 1, 'clamps below min');
assert.equal(clampNumber('abc', SETTINGS_BOUNDS.NUM_DEPARTURES, 7), 7, 'falls back on NaN');
assert.equal(clampNumber('25', SETTINGS_BOUNDS.NUM_DEPARTURES, 5), 25, 'accepts numeric strings');

// ── validateOptions clamps and whitelists instead of trusting raw form input
{
  const opts = validateOptions(
    {
      STATION_NAME: 'Test Station',
      STOP_ID: 'NSR:StopPlace:1',
      NUM_DEPARTURES: '300',
      FETCH_INTERVAL: '5',
      TRANSPORT_MODES: ['bus', 'spaceship'],
      TEXT_SIZE: 'huge',
      LAT: null,
      LON: null,
    },
    DEFAULTS
  );
  assert.equal(opts.NUM_DEPARTURES, SETTINGS_BOUNDS.NUM_DEPARTURES.max, 'clamped to max');
  assert.equal(opts.FETCH_INTERVAL, SETTINGS_BOUNDS.FETCH_INTERVAL.min, 'clamped to min');
  assert.deepEqual(opts.TRANSPORT_MODES, ['bus'], 'unknown modes dropped');
  assert.equal(opts.TEXT_SIZE, DEFAULT_TEXT_SIZE, 'invalid text size falls back');
}

// ── empty mode selection falls back to every mode ──────────────────────────
{
  const opts = validateOptions({ TRANSPORT_MODES: [] }, DEFAULTS);
  assert.deepEqual(opts.TRANSPORT_MODES, ALL_TRANSPORT_MODES, 'empty modes → all modes');
}

// ── round-trip: bounds-valid writes survive the bootstrap loader ───────────
{
  Object.assign(DEFAULTS, {
    STATION_NAME: 'Extreme Station',
    STOP_ID: 'NSR:StopPlace:2',
    NUM_DEPARTURES: SETTINGS_BOUNDS.NUM_DEPARTURES.max,
    FETCH_INTERVAL: SETTINGS_BOUNDS.FETCH_INTERVAL.max,
    TRANSPORT_MODES: ['tram'],
    TEXT_SIZE: 'small',
  });
  saveSettings();

  Object.assign(DEFAULTS, {
    STATION_NAME: 'Neutral',
    STOP_ID: null,
    NUM_DEPARTURES: 5,
    FETCH_INTERVAL: 60,
    TRANSPORT_MODES: ['bus'],
    TEXT_SIZE: DEFAULT_TEXT_SIZE,
  });
  loadSettings();

  assert.equal(DEFAULTS.STATION_NAME, 'Extreme Station');
  assert.equal(DEFAULTS.NUM_DEPARTURES, SETTINGS_BOUNDS.NUM_DEPARTURES.max);
  assert.equal(DEFAULTS.FETCH_INTERVAL, SETTINGS_BOUNDS.FETCH_INTERVAL.max);
  assert.equal(DEFAULTS.TEXT_SIZE, 'small');
}

// ── corrupt storage: out-of-range numbers dropped, valid fields kept ───────
{
  store.set(
    'departure:settings',
    JSON.stringify({ STATION_NAME: 'Bad Values', FETCH_INTERVAL: 5, NUM_DEPARTURES: 99 })
  );
  Object.assign(DEFAULTS, {
    STATION_NAME: 'Neutral',
    NUM_DEPARTURES: 5,
    FETCH_INTERVAL: 60,
  });
  loadSettings();
  assert.equal(DEFAULTS.STATION_NAME, 'Bad Values', 'valid string field applied');
  assert.equal(DEFAULTS.NUM_DEPARTURES, 5, 'out-of-range count dropped');
  assert.equal(DEFAULTS.FETCH_INTERVAL, 60, 'out-of-range interval dropped');
}

// ── diffOptions detects real changes only ──────────────────────────────────
{
  const a = validateOptions({ STATION_NAME: 'X', FETCH_INTERVAL: 60, NUM_DEPARTURES: 5 }, DEFAULTS);
  const b = { ...a, FETCH_INTERVAL: 30 };
  assert.equal(diffOptions(a, a), false, 'identical options → no diff');
  assert.equal(diffOptions(a, b), true, 'changed interval → diff');
}

// ── restore globals and the DEFAULTS singleton ─────────────────────────────
globalThis.localStorage = prevLocalStorage;
Object.assign(DEFAULTS, snapshot);

console.log('settings-validation.test.mjs OK');
