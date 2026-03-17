/**
 * @file Tests for lat/lon in share-button encodeSettings / decodeSettings
 *
 * Verifies that:
 *   - encodeSettings includes lat/lon in the 5-element array
 *   - decodeSettings extracts them correctly
 *   - Old 3-element URLs decode with lat/lon = null
 *   - Invalid coordinates are rejected
 */

import assert from 'assert/strict';

console.log('Running share-gps.test.mjs');

// TextEncoder / TextDecoder / btoa / atob shims for Node
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');

const { encodeSettings, decodeSettings } = await import('../src/ui/share-button.js');

// ── encodeSettings with lat/lon ───────────────────────────────────────────────

// Test 1: Round-trip preserves lat/lon
{
  const settings = {
    STATION_NAME: 'Oslo S',
    STOP_ID: 'NSR:StopPlace:59872',
    TRANSPORT_MODES: ['bus', 'rail'],
    LAT: 59.9111,
    LON: 10.7528,
  };
  const encoded = encodeSettings(settings);
  assert.ok(encoded, 'Should produce a non-null encoded string');
  const decoded = decodeSettings(encoded);
  assert.ok(decoded, 'Should decode successfully');
  assert.equal(decoded.stationName, 'Oslo S', 'Station name round-trip');
  assert.equal(decoded.stopId, 'NSR:StopPlace:59872', 'Stop ID round-trip');
  assert.ok(Math.abs(decoded.lat - 59.9111) < 0.00001, 'lat round-trip');
  assert.ok(Math.abs(decoded.lon - 10.7528) < 0.00001, 'lon round-trip');
}

// Test 2: null lat/lon encoded and decoded as null
{
  const settings = {
    STATION_NAME: 'Jernbanetorget',
    STOP_ID: 'NSR:StopPlace:12345',
    TRANSPORT_MODES: ['bus'],
    LAT: null,
    LON: null,
  };
  const encoded = encodeSettings(settings);
  const decoded = decodeSettings(encoded);
  assert.equal(decoded.lat, null, 'null lat decoded as null');
  assert.equal(decoded.lon, null, 'null lon decoded as null');
}

// Test 3: Missing lat/lon fields (undefined) — encoded as null
{
  const settings = {
    STATION_NAME: 'Bergen S',
    STOP_ID: 'NSR:StopPlace:99999',
    TRANSPORT_MODES: ['rail'],
    // no LAT/LON
  };
  const encoded = encodeSettings(settings);
  const decoded = decodeSettings(encoded);
  assert.equal(decoded.lat, null, 'missing LAT encoded as null, decoded as null');
  assert.equal(decoded.lon, null, 'missing LON encoded as null, decoded as null');
}

// ── decodeSettings — old 3-element format gives null coords ──────────────────

// Test 4: Old 3-element share URL → lat/lon are null
{
  // Build a 3-element encoded string manually
  const data = ['Oslo S', 'NSR:StopPlace:59872', ['bus']];
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const decoded = decodeSettings(b64);
  assert.ok(decoded, 'Old 3-element URL should decode');
  assert.equal(decoded.lat, null, '3-element URL: lat is null');
  assert.equal(decoded.lon, null, '3-element URL: lon is null');
}

// ── Coordinate validation ─────────────────────────────────────────────────────

// Test 5: Out-of-range lat is rejected (>90)
{
  const data = ['X', 'NSR:StopPlace:1', ['bus'], 999, 10]; // lat=999
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const decoded = decodeSettings(b64);
  assert.ok(decoded, 'Should still decode (only coord is rejected)');
  assert.equal(decoded.lat, null, 'Out-of-range lat (999) should be null');
  assert.ok(Math.abs(decoded.lon - 10) < 0.001, 'Valid lon should be decoded');
}

// Test 6: Out-of-range lon is rejected (<-180)
{
  const data = ['X', 'NSR:StopPlace:1', ['bus'], 59.9, -999];
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const decoded = decodeSettings(b64);
  assert.equal(decoded.lon, null, 'Out-of-range lon (-999) should be null');
  assert.ok(Math.abs(decoded.lat - 59.9) < 0.001, 'Valid lat should be decoded');
}

// Test 7: Negative coordinates (southern/western hemisphere) decode correctly
{
  const settings = {
    STATION_NAME: 'Sydney Central',
    STOP_ID: 'NSR:StopPlace:00001',
    TRANSPORT_MODES: ['rail'],
    LAT: -33.8688,
    LON: 151.2093,
  };
  const encoded = encodeSettings(settings);
  const decoded = decodeSettings(encoded);
  assert.ok(Math.abs(decoded.lat - -33.8688) < 0.0001, 'Negative lat round-trip');
  assert.ok(Math.abs(decoded.lon - 151.2093) < 0.0001, 'Positive lon round-trip');
}

console.log('share-gps.test.mjs OK');
