/**
 * @file Tests for GPS lat/lon persistence in favorites (station-dropdown.js)
 *
 * Verifies that addRecentStation stores lat/lon and that
 * getRecentStations returns them correctly.
 */

import assert from 'assert/strict';

console.log('Running favorites-gps.test.mjs');

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}
global.localStorage = new LocalStorageMock();

// Minimal DOM shim (required by module imports)
global.document = {
  createElement: () => ({
    className: '',
    textContent: '',
    title: '',
    type: '',
    disabled: false,
    style: {},
    dataset: {},
    children: [],
    childNodes: [],
    setAttribute() {},
    getAttribute() {
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(c) {
      this.children.push(c);
      return c;
    },
    removeChild() {},
    append() {},
    replaceChild() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    classList: {
      add() {},
      remove() {},
      contains() {
        return false;
      },
    },
    scrollIntoView() {},
    focus() {},
    select() {},
    contains() {
      return false;
    },
  }),
  addEventListener() {},
  removeEventListener() {},
  activeElement: null,
  body: { classList: { add() {}, remove() {} } },
};

const { addRecentStation, getRecentStations } = await import('../src/ui/station-dropdown.js');

// Test 1: lat/lon stored and retrieved correctly
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], {
    lat: 59.910843,
    lon: 10.750595,
  });
  const stations = getRecentStations();
  assert.equal(stations.length, 1, 'Should have one entry');
  assert.ok(Math.abs(stations[0].lat - 59.910843) < 0.000001, 'lat should be stored');
  assert.ok(Math.abs(stations[0].lon - 10.750595) < 0.000001, 'lon should be stored');
}

// Test 2: Missing lat/lon stored as undefined (not null)
{
  localStorage.clear();
  addRecentStation('Bergen S', 'NSR:StopPlace:12345', ['rail'], {});
  const stations = getRecentStations();
  assert.equal(stations[0].lat, undefined, 'lat should be undefined when not provided');
  assert.equal(stations[0].lon, undefined, 'lon should be undefined when not provided');
}

// Test 3: Non-number lat/lon is rejected (stored as undefined)
{
  localStorage.clear();
  addRecentStation('Trondheim S', 'NSR:StopPlace:99999', ['rail'], {
    lat: 'invalid',
    lon: 12.3,
  });
  const stations = getRecentStations();
  assert.equal(stations[0].lat, undefined, 'String lat should be rejected');
  assert.ok(Math.abs(stations[0].lon - 12.3) < 0.001, 'Valid lon should be stored');
}

// Test 4: Updating a station preserves coordinates
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], { lat: 59.91, lon: 10.75 });
  // Re-add the same station with different coords (e.g. after GPS fix)
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], { lat: 59.9111, lon: 10.7528 });
  const stations = getRecentStations();
  // Should still be 1 entry (deduplication by stopId+modes)
  assert.equal(stations.length, 1, 'Deduplication should leave 1 entry');
  assert.ok(Math.abs(stations[0].lat - 59.9111) < 0.0001, 'Updated lat should be stored');
}

// Test 5: Null values for lat/lon are rejected
{
  localStorage.clear();
  addRecentStation('Drammen', 'NSR:StopPlace:77777', ['bus'], { lat: null, lon: null });
  const stations = getRecentStations();
  assert.equal(stations[0].lat, undefined, 'null lat should be stored as undefined');
  assert.equal(stations[0].lon, undefined, 'null lon should be stored as undefined');
}

console.log('favorites-gps.test.mjs OK');
