/**
 * @file Tests for station dropdown localStorage functions
 */

import assert from 'assert/strict';

console.log('Running station-dropdown.test.mjs');

// Mock localStorage for Node.js environment
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

// Import module after setting up mocks
const { getRecentStations, addRecentStation } = await import('../src/ui/station-dropdown.js');

// Test 1: Empty recent stations
{
  localStorage.clear();
  const recent = getRecentStations();
  assert.deepEqual(recent, []);
}

// Test 2: Add a station to recent list
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872');
  const recent = getRecentStations();
  assert.equal(recent.length, 1);
  assert.equal(recent[0].name, 'Oslo S');
  assert.equal(recent[0].stopId, 'NSR:StopPlace:59872');
}

// Test 3: Add stations to top of list (LIFO)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872');
  addRecentStation('Nationaltheatret', 'NSR:StopPlace:58366');
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2);
  assert.equal(recent[0].name, 'Nationaltheatret');
  assert.equal(recent[1].name, 'Oslo S');
}

// Test 4: Move existing station to top when re-added
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872');
  addRecentStation('Nationaltheatret', 'NSR:StopPlace:58366');
  addRecentStation('Majorstuen', 'NSR:StopPlace:58278');
  
  // Re-select Oslo S
  addRecentStation('Oslo S', 'NSR:StopPlace:59872');
  
  const recent = getRecentStations();
  assert.equal(recent.length, 3);
  assert.equal(recent[0].name, 'Oslo S');
  assert.equal(recent[1].name, 'Majorstuen');
  assert.equal(recent[2].name, 'Nationaltheatret');
}

// Test 5: Limit to max 5 stations
{
  localStorage.clear();
  addRecentStation('Station 1', 'ID-1');
  addRecentStation('Station 2', 'ID-2');
  addRecentStation('Station 3', 'ID-3');
  addRecentStation('Station 4', 'ID-4');
  addRecentStation('Station 5', 'ID-5');
  addRecentStation('Station 6', 'ID-6');
  
  const recent = getRecentStations();
  assert.equal(recent.length, 5);
  assert.equal(recent[0].name, 'Station 6');
  assert.equal(recent[4].name, 'Station 2');
  
  // Station 1 should be dropped
  const hasStation1 = recent.some(s => s.name === 'Station 1');
  assert.equal(hasStation1, false);
}

// Test 6: Handle missing parameters gracefully
{
  localStorage.clear();
  addRecentStation();
  addRecentStation('Oslo S');
  addRecentStation(null, 'NSR:StopPlace:59872');
  
  const recent = getRecentStations();
  assert.equal(recent.length, 0);
}

// Test 7: Handle corrupted localStorage data
{
  localStorage.clear();
  localStorage.setItem('recent-stations', 'invalid-json');
  const recent = getRecentStations();
  assert.deepEqual(recent, []);
}

console.log('station-dropdown.test.mjs OK');
