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
          layer: 'venue'
        }
      },
      {
        properties: {
          id: 'some-address-id',
          name: 'Berg street',
          label: 'Berg street, Oslo',
          layer: 'address' // This should be filtered out
        }
      },
      {
        properties: {
          id: 'NSR:StopPlace:12345',
          name: 'Bergkrystallen',
          label: 'Bergkrystallen, Oslo',
          layer: 'venue'
        }
      }
    ]
  };

  // Mock fetch function
  const mockFetch = async (url) => {
    console.log('Mock fetch called with:', url);
    return {
      ok: true,
      headers: {
        get: (name) => name === 'content-type' ? 'application/json' : null
      },
      json: async () => mockApiResponse
    };
  };

  // Test searching for "berg"
  const results = await searchStations({
    text: 'berg',
    limit: 5,
    fetchFn: mockFetch
  });

  console.log('Search results:', results);

  // Should only return venue layer results
  assert.equal(results.length, 2, 'Should return 2 venue results (filtered out address layer)');
  
  // Should prioritize "Bergkrystallen" over "Jernbanetorget" because it starts with "berg"
  assert.equal(results[0].title, 'Bergkrystallen, Oslo', 'First result should be Bergkrystallen (starts with query)');
  assert.equal(results[0].id, 'NSR:StopPlace:12345');
  
  assert.equal(results[1].title, 'Jernbanetorget, Oslo', 'Second result should be Jernbanetorget (contains "erg")');
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
          layer: 'venue'
        }
      },
      {
        properties: {
          id: 'NSR:StopPlace:2',
          name: 'Bergen',
          label: 'Bergen',
          layer: 'venue'
        }
      }
    ]
  };

  const mockFetch = async () => ({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => mockApiResponse
  });

  const results = await searchStations({
    text: 'bergen',
    limit: 5,
    fetchFn: mockFetch
  });

  // Exact match should come first
  assert.equal(results[0].title, 'Bergen', 'Exact match should be first');
  assert.equal(results[1].title, 'Bergen sentrum', 'Starts-with match should be second');
});

test('searchStations actual API call for "berg"', async () => {
  // Real API call to see what we actually get for short query
  const results = await searchStations({
    text: 'berg',
    limit: 5,
    fetchFn: fetch
  });

  console.log('\n=== REAL API RESULTS for "berg" ===');
  console.log('Number of results:', results.length);
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.title} (${r.id})`);
  });
  console.log('=====================================\n');
});

test('searchStations actual API call for "bergkry"', async () => {
  // Real API call to see what we actually get
  const results = await searchStations({
    text: 'bergkry',
    limit: 5,
    fetchFn: fetch
  });

  console.log('\n=== REAL API RESULTS for "bergkry" ===');
  console.log('Number of results:', results.length);
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.title} (${r.id})`);
  });
  console.log('=====================================\n');

  // This test just logs results, no assertions
  // We'll see what the real API returns
});
