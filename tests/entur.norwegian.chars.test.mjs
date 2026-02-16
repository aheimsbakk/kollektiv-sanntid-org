// Test to verify Norwegian characters (æøå) work correctly in station searches
import { searchStations, lookupStopId } from '../src/entur.js';

const TEST_NAME = 'entur.norwegian.chars.test.mjs';

// Test that URL encoding works correctly for Norwegian characters
function testUrlEncoding() {
  console.log('\nTesting URL encoding for Norwegian characters:');
  const testCases = [
    { input: 'Støren', expected: 'St%C3%B8ren' },
    { input: 'Øvre Åsen', expected: '%C3%98vre%20%C3%85sen' },
    { input: 'Lærdal', expected: 'L%C3%A6rdal' }
  ];
  
  testCases.forEach(({ input, expected }) => {
    const encoded = encodeURIComponent(input);
    console.log(`  "${input}" -> "${encoded}" ${encoded === expected ? '✓' : '✗ (expected: ' + expected + ')'}`);
    if (encoded !== expected) {
      throw new Error(`URL encoding failed for "${input}": got "${encoded}", expected "${expected}"`);
    }
  });
  
  console.log('  ✓ All URL encoding tests passed');
}

// Mock fetch to simulate Entur's response for Norwegian characters
function createMockFetch() {
  return async (url, opts) => {
    console.log('\nMock fetch called with URL:', url);
    
    // Check if the URL contains properly encoded Norwegian characters
    if (url.includes('St%C3%B8ren') || url.includes('Støren')) {
      console.log('  ✓ Detected Støren request (with ø)');
      const mockResponse = {
        features: [
          {
            properties: {
              id: 'NSR:StopPlace:43613',
              name: 'Støren',
              label: 'Støren stasjon, Støren',
              category: ['railStation']
            }
          }
        ]
      };
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse
      };
    }
    
    if (url.includes('%C3%98vre') || url.includes('Øvre')) {
      console.log('  ✓ Detected Øvre request (with Ø)');
      const mockResponse = {
        features: [
          {
            properties: {
              id: 'NSR:StopPlace:12345',
              name: 'Øvre Åsen',
              label: 'Øvre Åsen, Oslo',
              category: ['onstreetBus']
            }
          }
        ]
      };
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse
      };
    }
    
    if (url.includes('L%C3%A6rdal') || url.includes('Lærdal')) {
      console.log('  ✓ Detected Lærdal request (with æ)');
      const mockResponse = {
        features: [
          {
            properties: {
              id: 'NSR:StopPlace:67890',
              name: 'Lærdal',
              label: 'Lærdal skysstasjon, Lærdal',
              category: ['busStation']
            }
          }
        ]
      };
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse
      };
    }
    
    console.log('  ✗ No matching mock for this URL');
    return {
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ features: [] })
    };
  };
}

async function runTest() {
  console.log(`Running ${TEST_NAME}`);
  
  // First test URL encoding
  testUrlEncoding();
  
  const mockFetch = createMockFetch();
  
  // Test 1: Search for "Støren" (contains ø)
  console.log('\n\n1. Testing searchStations with "Støren"');
  const storenCandidates = await searchStations({ 
    text: 'Støren', 
    limit: 5, 
    fetchFn: mockFetch 
  });
  
  console.log('  Results:', storenCandidates.length, 'candidates');
  if (storenCandidates.length === 0) {
    throw new Error('Expected to find candidates for "Støren"');
  }
  console.log('  First candidate:', storenCandidates[0].title);
  if (!storenCandidates[0].title.includes('Støren')) {
    throw new Error('Expected candidate title to contain "Støren"');
  }
  console.log('  ✓ Success: Found Støren');
  
  // Test 2: Lookup stopId for "Støren"
  console.log('\n2. Testing lookupStopId with "Støren"');
  const storenId = await lookupStopId({ 
    stationName: 'Støren', 
    fetchFn: mockFetch 
  });
  
  console.log('  Result:', storenId);
  if (!storenId) {
    throw new Error('Expected to get stopId for "Støren"');
  }
  console.log('  ✓ Success: Got stopId for Støren');
  
  // Test 3: Search for "Øvre Åsen" (contains Ø and å)
  console.log('\n3. Testing searchStations with "Øvre Åsen"');
  const ovreCandidates = await searchStations({ 
    text: 'Øvre Åsen', 
    limit: 5, 
    fetchFn: mockFetch 
  });
  
  console.log('  Results:', ovreCandidates.length, 'candidates');
  if (ovreCandidates.length === 0) {
    throw new Error('Expected to find candidates for "Øvre Åsen"');
  }
  console.log('  ✓ Success: Found Øvre Åsen');
  
  // Test 4: Search for "Lærdal" (contains æ)
  console.log('\n4. Testing searchStations with "Lærdal"');
  const laerdalCandidates = await searchStations({ 
    text: 'Lærdal', 
    limit: 5, 
    fetchFn: mockFetch 
  });
  
  console.log('  Results:', laerdalCandidates.length, 'candidates');
  if (laerdalCandidates.length === 0) {
    throw new Error('Expected to find candidates for "Lærdal"');
  }
  console.log('  ✓ Success: Found Lærdal');
  
  console.log(`\n${TEST_NAME} OK`);
}

runTest().catch(err => {
  console.error(`${TEST_NAME} FAILED:`, err.message);
  console.error(err.stack);
  process.exit(1);
});
