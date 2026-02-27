/**
 * @file Tests for the toggle-all checkbox tri-state logic (pure function).
 * The actual updateToggleAllState() is internal to options.js and works on DOM elements.
 * Here we test the equivalent pure logic extracted from the implementation.
 */

import assert from 'assert/strict';

console.log('Running toggle-all.test.mjs');

/**
 * Pure logic extracted from options.js updateToggleAllState():
 * Given an array of boolean values (checkbox states), compute the toggle-all state.
 * @param {boolean[]} states - Array of individual checkbox checked states
 * @returns {{ checked: boolean, indeterminate: boolean }}
 */
function computeToggleAllState(states) {
  const total = states.length;
  const checkedCount = states.filter(Boolean).length;
  if (checkedCount === 0) {
    return { checked: false, indeterminate: false };
  } else if (checkedCount === total) {
    return { checked: true, indeterminate: false };
  } else {
    return { checked: false, indeterminate: true };
  }
}

/**
 * Pure logic extracted from options.js toggle-all click handler:
 * When the toggle-all checkbox is clicked, all checkboxes should match its state.
 * @param {boolean} toggleAllChecked - The new state of the toggle-all checkbox
 * @param {number} count - Number of individual checkboxes
 * @returns {boolean[]} - New states for all individual checkboxes
 */
function applyToggleAll(toggleAllChecked, count) {
  return Array(count).fill(toggleAllChecked);
}

// --- computeToggleAllState tests ---

// Test 1: All unchecked → unchecked, not indeterminate
{
  const result = computeToggleAllState([false, false, false, false, false, false]);
  assert.equal(result.checked, false, 'All unchecked: checked should be false');
  assert.equal(result.indeterminate, false, 'All unchecked: indeterminate should be false');
}

// Test 2: All checked → checked, not indeterminate
{
  const result = computeToggleAllState([true, true, true, true, true, true]);
  assert.equal(result.checked, true, 'All checked: checked should be true');
  assert.equal(result.indeterminate, false, 'All checked: indeterminate should be false');
}

// Test 3: Some checked → unchecked, indeterminate
{
  const result = computeToggleAllState([true, false, true, false, false, false]);
  assert.equal(result.checked, false, 'Some checked: checked should be false');
  assert.equal(result.indeterminate, true, 'Some checked: indeterminate should be true');
}

// Test 4: One checked out of six → indeterminate
{
  const result = computeToggleAllState([true, false, false, false, false, false]);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, true);
}

// Test 5: Five checked out of six → indeterminate
{
  const result = computeToggleAllState([true, true, true, true, true, false]);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, true);
}

// Test 6: Empty array → unchecked (edge case)
{
  const result = computeToggleAllState([]);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, false);
}

// Test 7: Single checkbox checked → all checked
{
  const result = computeToggleAllState([true]);
  assert.equal(result.checked, true);
  assert.equal(result.indeterminate, false);
}

// Test 8: Single checkbox unchecked → unchecked
{
  const result = computeToggleAllState([false]);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, false);
}

// --- applyToggleAll tests ---

// Test 9: Toggle all ON → all true
{
  const result = applyToggleAll(true, 6);
  assert.equal(result.length, 6);
  assert.ok(result.every(v => v === true), 'All should be true');
}

// Test 10: Toggle all OFF → all false
{
  const result = applyToggleAll(false, 6);
  assert.equal(result.length, 6);
  assert.ok(result.every(v => v === false), 'All should be false');
}

// Test 11: Round-trip: toggle all ON, then compute state → checked
{
  const states = applyToggleAll(true, 6);
  const result = computeToggleAllState(states);
  assert.equal(result.checked, true);
  assert.equal(result.indeterminate, false);
}

// Test 12: Round-trip: toggle all OFF, then compute state → unchecked
{
  const states = applyToggleAll(false, 6);
  const result = computeToggleAllState(states);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, false);
}

// Test 13: Round-trip: toggle all ON, uncheck one → indeterminate
{
  const states = applyToggleAll(true, 6);
  states[3] = false; // Uncheck one
  const result = computeToggleAllState(states);
  assert.equal(result.checked, false);
  assert.equal(result.indeterminate, true);
}

console.log('toggle-all.test.mjs OK');
