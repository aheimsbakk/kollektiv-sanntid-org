/**
 * departure-delay.test.mjs
 *
 * Unit tests for isDepartureDelayed() — the pure helper that determines
 * whether a departure should show a red (--danger) realtime indicator.
 *
 * Rule: delayed = realtime === true AND
 *       (expectedDepartureISO − aimedDepartureISO) >= DELAY_THRESHOLD_MS (60 s)
 *
 * The 60 s threshold filters out normal Entur realtime tracking noise
 * (±30–60 s adjustments that occur even for on-time vehicles).
 */

import assert from 'assert/strict';
import { isDepartureDelayed } from '../src/ui/departure.js';

console.log('Running departure-delay.test.mjs');

// --- Delayed: realtime=true, expected is 5 min later than aimed (well above threshold) ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:05:00Z',
  }),
  true,
  'should be delayed when gap >= 60 s and realtime=true'
);

// --- Exactly at threshold: 60 s gap → delayed ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:01:00Z',
  }),
  true,
  'should be delayed when gap is exactly 60 s (at threshold)'
);

// --- Sub-threshold noise: 30 s gap → NOT delayed ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:00:30Z',
  }),
  false,
  'should NOT be delayed when gap is only 30 s (below threshold — normal tracking noise)'
);

// --- Sub-threshold noise: 59 s gap → NOT delayed ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:00:59Z',
  }),
  false,
  'should NOT be delayed when gap is 59 s (just below threshold)'
);

// --- On-time: realtime=true, aimed === expected ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:00:00Z',
  }),
  false,
  'should NOT be delayed when aimed === expected'
);

// --- Early: realtime=true, expected is earlier than aimed (early departure) ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:05:00Z',
    expectedDepartureISO: '2026-03-16T10:00:00Z',
  }),
  false,
  'should NOT be delayed when expected < aimed (early departure)'
);

// --- No realtime data: even if times differ, not delayed ---
assert.equal(
  isDepartureDelayed({
    realtime: false,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:05:00Z',
  }),
  false,
  'should NOT be delayed when realtime=false'
);

// --- Missing realtime field ---
assert.equal(
  isDepartureDelayed({
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:05:00Z',
  }),
  false,
  'should NOT be delayed when realtime field is absent'
);

// --- Missing aimed ISO ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: null,
    expectedDepartureISO: '2026-03-16T10:05:00Z',
  }),
  false,
  'should NOT be delayed when aimedDepartureISO is null'
);

// --- Missing expected ISO ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: null,
  }),
  false,
  'should NOT be delayed when expectedDepartureISO is null'
);

// --- Null item ---
assert.equal(isDepartureDelayed(null), false, 'should NOT throw or be delayed for null item');

// --- Undefined item ---
assert.equal(
  isDepartureDelayed(undefined),
  false,
  'should NOT throw or be delayed for undefined item'
);

console.log('departure-delay.test.mjs OK');
