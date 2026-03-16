/**
 * departure-delay.test.mjs
 *
 * Unit tests for isDepartureDelayed() — the pure helper that determines
 * whether a departure should show a red (--danger) realtime indicator.
 *
 * Rule: delayed = realtime === true AND aimedDepartureISO < expectedDepartureISO
 */

import assert from 'assert/strict';
import { isDepartureDelayed } from '../src/ui/departure.js';

console.log('Running departure-delay.test.mjs');

// --- Delayed: realtime=true, expected is later than aimed ---
assert.equal(
  isDepartureDelayed({
    realtime: true,
    aimedDepartureISO: '2026-03-16T10:00:00Z',
    expectedDepartureISO: '2026-03-16T10:05:00Z',
  }),
  true,
  'should be delayed when expected > aimed and realtime=true'
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
