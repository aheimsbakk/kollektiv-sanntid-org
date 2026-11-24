import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchStations } from '../src/entur/index.js';

test('searchStations filters and scores results correctly', async () => {
  // Mock API response with 3 features like the real API returns for "berg"
  const mockApiResponse = {
    features: [
      {
        properties: {
          id: 'NSR:StopPlace:58366',
          name: 'Jernbanetorget',
          label: 'Jernbanetorget, Oslo',
          layer: 'venue',
        },
      },
      {
        properties: {
          id: 'some-address-id',
          name: 'Berg street',
          label: 'Berg street, Oslo',
          layer: 'address', // This should be filtered out
        },
      },
      {
        properties: {
          id: 'NSR:StopPlace:12345',
          name: 'Bergkrystallen',
          label: 'Bergkrystallen, Oslo',
          layer: 'venue',
        },
      },
    ],
  };

  // Mock fetch function
  const mockFetch = async (url) => {
    console.log('Mock fetch called with:', url);
    return {
      ok: true,
      headers: {
        get: (name) => (name === 'content-type' ? 'application/json' : null),
      },
      json: async () => mockApiResponse,
    };
  };

  // Test searching for "berg"
  const results = await searchStations({
    text: 'berg',
    limit: 5,
    fetchFn: mockFetch,
  });

  console.log('Search results:', results);

  // Should only return venue layer results
  assert.equal(results.length, 2, 'Should return 2 venue results (filtered out address layer)');

  // Should prioritize "Bergkrystallen" over "Jernbanetorget" because it starts with "berg"
  assert.equal(
    results[0].title,
    'Bergkrystallen, Oslo',
    'First result should be Bergkrystallen (starts with query)'
  );
  assert.equal(results[0].id, 'NSR:StopPlace:12345');

  assert.equal(
    results[1].title,
    'Jernbanetorget, Oslo',
    'Second result should be Jernbanetorget (contains "erg")'
  );
  assert.equal(results[1].id, 'NSR:StopPlace:58366');
});

test('searchStations handles exact match priority', async () => {
  const mockApiResponse = {
    features: [
      {
        properties: {
          id: 'NSR:StopPlace:1',
          name: 'Bergen sentrum',
          label: 'Bergen sentrum',
          layer: 'venue',
        },
      },
      {
        properties: {
          id: 'NSR:StopPlace:2',
          name: 'Bergen',
          label: 'Bergen',
          layer: 'venue',
        },
      },
    ],
  };

  const mockFetch = async () => ({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => mockApiResponse,
  });

  const results = await searchStations({
    text: 'bergen',
    limit: 5,
    fetchFn: mockFetch,
  });

  // Exact match should come first
  assert.equal(results[0].title, 'Bergen', 'Exact match should be first');
  assert.equal(results[1].title, 'Bergen sentrum', 'Starts-with match should be second');
});

test('searchStations keeps only venue-layer results', async () => {
  // Replaces the two earlier probes that called the live geocoder with
  // `fetchFn: fetch` and asserted nothing. The suite must stay hermetic;
  // live-API checks live in tests/entur.storen.autocomplete.test.mjs and
  // tests/entur.norwegian.real.test.mjs, which run.mjs does not import.
  const mockApiResponse = {
    features: [
      { properties: { id: 'NSR:StopPlace:1', name: 'Berg', label: 'Berg, Oslo', layer: 'venue' } },
      {
        properties: {
          id: 'addr:1',
          name: 'Bergs gate',
          label: 'Bergs gate, Oslo',
          layer: 'address',
        },
      },
    ],
  };
  const mockFetch = async () => ({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => mockApiResponse,
  });

  const results = await searchStations({ text: 'berg', limit: 5, fetchFn: mockFetch });

  assert.equal(results.length, 1, 'address-layer features must be dropped');
  assert.equal(results[0].title, 'Berg, Oslo', 'the venue-layer feature must survive');
});
