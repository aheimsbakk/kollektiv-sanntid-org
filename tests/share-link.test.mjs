/**
 * @file Tests for share link encoding/decoding and favorites integration
 */

import assert from 'assert/strict';

console.log('Running share-link.test.mjs');

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

// Import modules after setting up mocks
const { encodeSettings, decodeSettings } = await import('../src/ui/share-button.js');
const { getRecentStations, addRecentStation } = await import('../src/ui/station-dropdown.js');

// Test 1: Encode and decode settings round-trip
{
  const originalSettings = {
    STATION_NAME: 'Oslo S',
    STOP_ID: 'NSR:StopPlace:59872',
    TRANSPORT_MODES: ['bus', 'metro'],
    NUM_DEPARTURES: 15,
    FETCH_INTERVAL: 45, // in seconds
    TEXT_SIZE: 'medium',
    language: 'no'
  };
  
  const encoded = encodeSettings(originalSettings);
  assert.ok(encoded, 'Should produce encoded string');
  assert.equal(typeof encoded, 'string');
  
  const decoded = decodeSettings(encoded);
  assert.ok(decoded, 'Should decode successfully');
  assert.equal(decoded.stationName, originalSettings.STATION_NAME);
  assert.equal(decoded.stopId, originalSettings.STOP_ID);
  assert.deepEqual(decoded.transportModes, originalSettings.TRANSPORT_MODES);
  assert.equal(decoded.numDepartures, originalSettings.NUM_DEPARTURES);
  assert.equal(decoded.fetchInterval, originalSettings.FETCH_INTERVAL);
  assert.equal(decoded.textSize, originalSettings.TEXT_SIZE);
  assert.equal(decoded.language, originalSettings.language);
}

// Test 2: Import shared station should add to favorites
{
  localStorage.clear();
  
  // Simulate importing a shared link
  const sharedSettings = {
    stationName: 'Nationaltheatret',
    stopId: 'NSR:StopPlace:58366',
    transportModes: ['metro', 'tram'],
    numDepartures: 10,
    fetchInterval: 30, // seconds
    textSize: 'large',
    language: 'en'
  };
  
  // This is what app.js does when importing a share link
  addRecentStation(sharedSettings.stationName, sharedSettings.stopId, sharedSettings.transportModes, {
    numDepartures: sharedSettings.numDepartures,
    fetchInterval: sharedSettings.fetchInterval,
    textSize: sharedSettings.textSize,
    language: sharedSettings.language
  });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'Should have 1 favorite');
  assert.equal(recent[0].name, 'Nationaltheatret');
  assert.equal(recent[0].stopId, 'NSR:StopPlace:58366');
  assert.deepEqual(recent[0].modes, ['metro', 'tram']);
  assert.equal(recent[0].numDepartures, 10);
  assert.equal(recent[0].fetchInterval, 30);
  assert.equal(recent[0].textSize, 'large');
  assert.equal(recent[0].language, 'en');
}

// Test 3: Import shared link should add to TOP of existing favorites
{
  localStorage.clear();
  
  // Add existing favorites
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus'], { numDepartures: 20 });
  addRecentStation('Majorstuen', 'NSR:StopPlace:58278', ['metro'], { numDepartures: 15 });
  
  let recent = getRecentStations();
  assert.equal(recent.length, 2);
  assert.equal(recent[0].name, 'Majorstuen');
  
  // Import shared link
  const sharedSettings = {
    stationName: 'Storo',
    stopId: 'NSR:StopPlace:58349',
    transportModes: ['bus', 'metro'],
    numDepartures: 25,
    fetchInterval: 60, // seconds
    textSize: 'xlarge',
    language: 'no'
  };
  
  addRecentStation(sharedSettings.stationName, sharedSettings.stopId, sharedSettings.transportModes, {
    numDepartures: sharedSettings.numDepartures,
    fetchInterval: sharedSettings.fetchInterval,
    textSize: sharedSettings.textSize,
    language: sharedSettings.language
  });
  
  recent = getRecentStations();
  assert.equal(recent.length, 3, 'Should have 3 favorites');
  assert.equal(recent[0].name, 'Storo', 'Imported station should be at top');
  assert.equal(recent[0].numDepartures, 25);
  assert.equal(recent[1].name, 'Majorstuen');
  assert.equal(recent[2].name, 'Oslo S');
}

// Test 4: Import same station+modes should update existing favorite
{
  localStorage.clear();
  
  // Add existing favorite
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro'], {
    numDepartures: 10,
    fetchInterval: 30, // seconds
    textSize: 'small',
    language: 'en'
  });
  
  addRecentStation('Majorstuen', 'NSR:StopPlace:58278', ['tram'], { numDepartures: 15 });
  
  // Import shared link with same station+modes but different settings
  const sharedSettings = {
    stationName: 'Oslo S',
    stopId: 'NSR:StopPlace:59872',
    transportModes: ['bus', 'metro'],
    numDepartures: 25,
    fetchInterval: 60, // seconds
    textSize: 'xlarge',
    language: 'no'
  };
  
  addRecentStation(sharedSettings.stationName, sharedSettings.stopId, sharedSettings.transportModes, {
    numDepartures: sharedSettings.numDepartures,
    fetchInterval: sharedSettings.fetchInterval,
    textSize: sharedSettings.textSize,
    language: sharedSettings.language
  });
  
  const recent = getRecentStations();
  assert.equal(recent.length, 2, 'Should still have 2 favorites (no duplicate)');
  assert.equal(recent[0].name, 'Oslo S', 'Oslo S should be at top');
  assert.equal(recent[0].numDepartures, 25, 'Settings should be updated');
  assert.equal(recent[0].fetchInterval, 60);
  assert.equal(recent[0].textSize, 'xlarge');
  assert.equal(recent[0].language, 'no');
  assert.equal(recent[1].name, 'Majorstuen');
}

// Test 5: Encode settings with minimal data
{
  const minimalSettings = {
    STATION_NAME: 'Test',
    STOP_ID: 'ID-1',
    TRANSPORT_MODES: [],
    NUM_DEPARTURES: 10,
    FETCH_INTERVAL: 30, // seconds
    TEXT_SIZE: 'large',
    language: 'en'
  };
  
  const encoded = encodeSettings(minimalSettings);
  const decoded = decodeSettings(encoded);
  
  assert.equal(decoded.stationName, 'Test');
  assert.equal(decoded.stopId, 'ID-1');
  // Empty modes defaults to all modes
  assert.deepEqual(decoded.transportModes, ['bus', 'tram', 'metro', 'rail', 'water', 'coach']);
}

// Test 6: Decode invalid/corrupted share link
{
  // Suppress expected error
  const originalError = console.error;
  console.error = () => {};
  
  const decoded = decodeSettings('invalid-base64-data!!!');
  
  console.error = originalError;
  
  assert.equal(decoded, null, 'Should return null for invalid data');
}

// Test 7: Encode URL-safe (no special characters that break URLs)
{
  const settings = {
    STATION_NAME: 'Test Station',
    STOP_ID: 'NSR:StopPlace:12345',
    TRANSPORT_MODES: ['bus', 'metro', 'tram'],
    NUM_DEPARTURES: 20,
    FETCH_INTERVAL: 45, // seconds
    TEXT_SIZE: 'medium',
    language: 'no'
  };
  
  const encoded = encodeSettings(settings);
  
  // URL-safe base64 should not contain +, /, or =
  assert.ok(!encoded.includes('+'), 'Should not contain +');
  assert.ok(!encoded.includes('/'), 'Should not contain /');
  assert.ok(!encoded.includes('='), 'Should not contain =');
}

console.log('share-link.test.mjs OK');
