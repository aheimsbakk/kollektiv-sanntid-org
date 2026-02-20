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
const { getRecentStations, addRecentStation, modesEqual } = await import('../src/ui/station-dropdown.js');

// Test modesEqual function
{
  assert.equal(modesEqual(['bus', 'metro'], ['bus', 'metro']), true, 'Same modes in same order');
  assert.equal(modesEqual(['bus', 'metro'], ['metro', 'bus']), true, 'Same modes in different order');
  assert.equal(modesEqual(['bus'], ['metro']), false, 'Different modes');
  assert.equal(modesEqual(['bus', 'metro'], ['bus']), false, 'Different lengths');
  assert.equal(modesEqual([], []), true, 'Both empty');
  assert.equal(modesEqual(null, null), true, 'Both null');
  assert.equal(modesEqual(undefined, undefined), true, 'Both undefined');
  assert.equal(modesEqual(null, []), true, 'Null equals empty');
  assert.equal(modesEqual([], undefined), true, 'Empty equals undefined');
}

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
  
  // Temporarily suppress console.error for this test (we expect an error)
  const originalError = console.error;
  console.error = () => {};
  
  const recent = getRecentStations();
  
  // Restore console.error
  console.error = originalError;
  
  assert.deepEqual(recent, []);
}

// Test 8: Same station with different transport modes should be separate entries
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['metro']);
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2, 'Should have 2 entries');
  assert.equal(recent[0].name, 'Oslo S');
  assert.deepEqual(recent[0].modes, ['metro']);
  assert.equal(recent[1].name, 'Oslo S');
  assert.deepEqual(recent[1].modes, ['bus']);
}

// Test 9: Same station + same modes (different order) should update, not duplicate
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro'], { numDepartures: 10 });
  addRecentStation('Nationaltheatret', 'NSR:StopPlace:58366', ['tram']);
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['metro', 'bus'], { numDepartures: 20 });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2, 'Should have 2 entries, not 3');
  assert.equal(recent[0].name, 'Oslo S', 'Oslo S should be at top');
  assert.equal(recent[0].numDepartures, 20, 'Should have updated settings');
  assert.equal(recent[1].name, 'Nationaltheatret');
}

// Test 10: Clicking existing favorite should move it to top with new settings
{
  localStorage.clear();
  addRecentStation('Station 1', 'ID-1', ['bus'], { numDepartures: 10 });
  addRecentStation('Station 2', 'ID-2', ['metro'], { numDepartures: 15 });
  addRecentStation('Station 3', 'ID-3', ['tram'], { numDepartures: 20 });
  
  // Click Station 1 again with new settings
  addRecentStation('Station 1', 'ID-1', ['bus'], { numDepartures: 25 });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 3, 'Should still have 3 entries');
  assert.equal(recent[0].name, 'Station 1', 'Station 1 should be at top');
  assert.equal(recent[0].numDepartures, 25, 'Should have new settings');
  assert.equal(recent[1].name, 'Station 3');
  assert.equal(recent[2].name, 'Station 2');
}

// Test 11: Same station with all modes vs specific modes should be different
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro', 'tram', 'rail', 'water', 'coach']);
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro']);
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2, 'Should have 2 separate entries');
  assert.deepEqual(recent[0].modes, ['bus', 'metro']);
  assert.deepEqual(recent[1].modes, ['bus', 'metro', 'tram', 'rail', 'water', 'coach']);
}

// Test 12: Save button should add/update station with current modes
{
  localStorage.clear();
  // Initial state: User has Oslo S with bus only
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], { numDepartures: 10 });
  addRecentStation('Nationaltheatret', 'NSR:StopPlace:58366', ['metro'], { numDepartures: 15 });
  
  // User selects Oslo S from dropdown (should move to top)
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], { numDepartures: 10 });
  
  let recent = getRecentStations();
  assert.equal(recent.length, 2);
  assert.equal(recent[0].name, 'Oslo S');
  
  // User changes modes to bus + metro and clicks Save
  // This should create a NEW entry because modes changed
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro'], { numDepartures: 10 });
  
  recent = getRecentStations();
  assert.equal(recent.length, 3, 'Should have 3 entries now');
  assert.equal(recent[0].name, 'Oslo S');
  assert.deepEqual(recent[0].modes, ['bus', 'metro'], 'Top entry should have new modes');
  assert.equal(recent[1].name, 'Oslo S');
  assert.deepEqual(recent[1].modes, ['bus'], 'Second entry should be old Oslo S with bus only');
  assert.equal(recent[2].name, 'Nationaltheatret');
  assert.deepEqual(recent[2].modes, ['metro']);
}

// Test 13: Verify all settings are stored with favorites
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro'], {
    numDepartures: 15,
    fetchInterval: 45000,
    textSize: 'medium',
    language: 'no'
  });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 1);
  assert.equal(recent[0].name, 'Oslo S');
  assert.equal(recent[0].stopId, 'NSR:StopPlace:59872');
  assert.deepEqual(recent[0].modes, ['bus', 'metro']);
  assert.equal(recent[0].numDepartures, 15, 'numDepartures should be stored');
  assert.equal(recent[0].fetchInterval, 45000, 'fetchInterval should be stored');
  assert.equal(recent[0].textSize, 'medium', 'textSize should be stored');
  assert.equal(recent[0].language, 'no', 'language should be stored');
}

// Test 14: Settings are preserved when station is moved to top
{
  localStorage.clear();
  addRecentStation('Station 1', 'ID-1', ['bus'], {
    numDepartures: 10,
    fetchInterval: 30000,
    textSize: 'small',
    language: 'en'
  });
  addRecentStation('Station 2', 'ID-2', ['metro'], {
    numDepartures: 20,
    fetchInterval: 60000,
    textSize: 'large',
    language: 'no'
  });
  
  // Re-select Station 1 with DIFFERENT settings
  addRecentStation('Station 1', 'ID-1', ['bus'], {
    numDepartures: 25,
    fetchInterval: 45000,
    textSize: 'xlarge',
    language: 'de'
  });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2);
  assert.equal(recent[0].name, 'Station 1', 'Station 1 should be at top');
  // Verify settings were updated to new values
  assert.equal(recent[0].numDepartures, 25, 'Should have new numDepartures');
  assert.equal(recent[0].fetchInterval, 45000, 'Should have new fetchInterval');
  assert.equal(recent[0].textSize, 'xlarge', 'Should have new textSize');
  assert.equal(recent[0].language, 'de', 'Should have new language');
  // Verify Station 2 settings remain unchanged
  assert.equal(recent[1].numDepartures, 20);
  assert.equal(recent[1].textSize, 'large');
}

// Test 15: Settings storage with undefined/null values
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], {
    numDepartures: undefined,
    fetchInterval: null,
    textSize: 'large',
    language: 'en'
  });
  
  const recent = getRecentStations();
  assert.equal(recent[0].numDepartures, undefined, 'Should preserve undefined');
  assert.equal(recent[0].fetchInterval, null, 'Should preserve null');
  assert.equal(recent[0].textSize, 'large');
}

// Test 16: Settings storage when settings parameter is omitted
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  
  const recent = getRecentStations();
  assert.equal(recent[0].numDepartures, undefined, 'Should be undefined when not provided');
  assert.equal(recent[0].fetchInterval, undefined);
  assert.equal(recent[0].textSize, undefined);
  assert.equal(recent[0].language, undefined);
}

// Test 17: Clicking favorite should preserve its stored settings (not overwrite with current)
{
  localStorage.clear();
  // Save Oslo S with specific settings
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], {
    numDepartures: 10,
    fetchInterval: 30000,
    textSize: 'small',
    language: 'en'
  });
  
  // Verify settings are stored
  let recent = getRecentStations();
  assert.equal(recent[0].numDepartures, 10);
  assert.equal(recent[0].fetchInterval, 30000);
  
  // Simulate clicking the favorite again (like selecting from dropdown)
  // This should move it to top but PRESERVE its original settings
  const savedStation = recent[0];
  addRecentStation(savedStation.name, savedStation.stopId, savedStation.modes, {
    numDepartures: savedStation.numDepartures,
    fetchInterval: savedStation.fetchInterval,
    textSize: savedStation.textSize,
    language: savedStation.language
  });
  
  // Verify settings are preserved
  recent = getRecentStations();
  assert.equal(recent[0].numDepartures, 10, 'numDepartures should be preserved');
  assert.equal(recent[0].fetchInterval, 30000, 'fetchInterval should be preserved');
  assert.equal(recent[0].textSize, 'small', 'textSize should be preserved');
  assert.equal(recent[0].language, 'en', 'language should be preserved');
}

console.log('station-dropdown.test.mjs OK');
