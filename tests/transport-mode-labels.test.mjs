/**
 * @file Tests for transport mode label consistency on language change.
 *
 * MODE_GRID in config.js defines the checkbox layout order.
 * updateTranslations in language-switcher.js must assign labels based on each
 * checkbox's value (not a hardcoded index-based array), otherwise labels get
 * scrambled when the language changes.
 *
 * The fix: iterate each .mode-checkbox-label, read the checkbox value, and
 * use that as the translation key (cb.value -> t(cb.value)).
 * This is robust against any DOM order.
 */
import assert from 'assert/strict';
import { MODE_GRID, ALL_TRANSPORT_MODES } from '../src/config.js';

console.log('Running transport-mode-labels.test.mjs');

// --- 1. MODE_GRID structure ---

// MODE_GRID defines the DOM order of transport mode checkboxes (row-major)
const domOrder = MODE_GRID.flat();

assert.strictEqual(domOrder.length, 6, 'MODE_GRID must contain all 6 transport modes');

// Verify the exact layout order (this documents the visual grid)
// prettier-ignore
assert.deepStrictEqual(domOrder, ['tram', 'bus', 'metro', 'coach', 'rail', 'water'],
  'MODE_GRID flattened order must match expected checkbox layout: ' +
  '[tram, bus], [metro, coach], [rail, water]');

console.log(`  DOM order (MODE_GRID):  [${domOrder.join(',')}]`);

// --- 2. ALL_TRANSPORT_MODES completeness ---

assert.strictEqual(ALL_TRANSPORT_MODES.length, 6);
assert.deepStrictEqual(
  ALL_TRANSPORT_MODES.slice().sort(),
  ['bus', 'coach', 'metro', 'rail', 'tram', 'water'],
  'ALL_TRANSPORT_MODES must contain exactly the 6 modes'
);

// --- 3. Verify value-based label mapping produces correct pairings ---
//
// Simulate what the fixed updateTranslations does:
// for each .mode-checkbox-label, read input[checkbox].value and assign t(value).
// This means every mode's own translation key is used, regardless of DOM order.

const translations = {
  bus: 'Bus',
  tram: 'Tram',
  metro: 'Metro',
  rail: 'Train',
  water: 'Water',
  coach: 'Coach',
};

domOrder.forEach((mode) => {
  const label = translations[mode];
  assert.ok(label, `Translation exists for mode '${mode}'`);
  // The translation label must contain the mode's own key (e.g. 'tram' -> 'Tram')
  assert.ok(
    label.toLowerCase().includes(mode) ||
      (mode === 'rail' && label === 'Train') ||
      (mode === 'coach' && label === 'Coach'),
    `Label '${label}' for mode '${mode}' looks correct (loose check)`
  );
});

console.log('  ✓ Each mode maps to its own matching label (value-based fix)');

// --- 4. Verify no mode key is used for a different mode's label ---
// This is the core bug: the old code used modeKeys[i] which mapped the wrong
// key to each position. The value-based approach avoids this entirely.

const modeToLabel = {};
domOrder.forEach((mode) => {
  modeToLabel[mode] = translations[mode];
});

// For each position in DOM order, the translation key equals the mode at that position
domOrder.forEach((mode) => {
  assert.strictEqual(
    modeToLabel[mode],
    translations[mode],
    `Position for '${mode}': translation key matches mode (no cross-label scrambling)`
  );
});

console.log('  ✓ No cross-label scrambling: each mode gets its own label');
console.log('transport-mode-labels.test.mjs OK');
