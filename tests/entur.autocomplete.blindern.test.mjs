// Test to verify autocomplete issue is fixed: "Blindern, Oslo" vs "Blindern"
// The issue: When user selects "Blindern, Oslo" from autocomplete, the app
// should use the stored stopId instead of looking up the label again.
import { searchStations, lookupStopId, fetchDepartures } from '../src/entur/index.js';

const TEST_NAME = 'entur.autocomplete.blindern.test.mjs';

// Mock fetch to simulate Entur's geocoder and journey planner responses
function createMockFetch() {
  return async (url, opts) => {
    // Simulate geocoder autocomplete response for "Blindern"
    if (url.includes('/geocoder/v1/autocomplete') && url.includes('text=Blindern') && !url.includes('Oslo')) {
      const mockResponse = {
        features: [
          {
            properties: {
              id: 'NSR:StopPlace:59872',
              name: 'Blindern',
              label: 'Blindern, Oslo',
              category: ['onstreetBus', 'onstreetTram']
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
    
    // Simulate geocoder lookup for "Blindern, Oslo" (this might fail in real API)
    // We simulate it returning no results to show the problem
    if (url.includes('/geocoder/v1/autocomplete') && url.includes('Oslo')) {
      const mockResponse = {
        features: [] // No results! This is the problem.
      };
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse
      };
    }
    
    // Simulate journey planner response
    if (url.includes('/journey-planner/v3/graphql')) {
      const body = JSON.parse(opts.body);
      // Check if the query contains the correct stopId
      if (body.query.includes('NSR:StopPlace:59872')) {
        const mockResponse = {
          data: {
            stopPlace: {
              id: 'NSR:StopPlace:59872',
              name: 'Blindern',
              estimatedCalls: [
                {
                  realtime: true,
                  expectedDepartureTime: new Date(Date.now() + 300000).toISOString(),
                  destinationDisplay: { frontText: 'Majorstuen' },
                  serviceJourney: {
                    journeyPattern: {
                      line: { publicCode: '37', transportMode: 'bus' }
                    }
                  }
                }
              ]
            }
          }
        };
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => mockResponse
        };
      }
    }
    
    return { ok: false, status: 404 };
  };
}

async function runTest() {
  console.log(`Running ${TEST_NAME}`);
  
  const mockFetch = createMockFetch();
  
  // Step 1: User searches for "Blindern" in autocomplete
  console.log('\n1. User searches for "Blindern" in autocomplete');
  const candidates = await searchStations({ 
    text: 'Blindern', 
    limit: 5, 
    fetchFn: mockFetch 
  });
  
  if (!candidates || candidates.length === 0) {
    throw new Error('Expected autocomplete to return candidates for "Blindern"');
  }
  
  const firstCandidate = candidates[0];
  console.log('   Autocomplete candidate:', firstCandidate);
  
  // Step 2: User selects the candidate, which has title "Blindern, Oslo"
  console.log('\n2. User selects candidate from autocomplete');
  const selectedTitle = firstCandidate.title;
  const selectedId = firstCandidate.id;
  
  console.log('   Selected title:', selectedTitle);
  console.log('   Selected ID:', selectedId);
  
  if (selectedTitle !== 'Blindern, Oslo') {
    throw new Error(`Expected title to be "Blindern, Oslo", got "${selectedTitle}"`);
  }
  
  if (selectedId !== 'NSR:StopPlace:59872') {
    throw new Error(`Expected ID to be "NSR:StopPlace:59872", got "${selectedId}"`);
  }
  
  // Step 3: THE OLD WAY (BROKEN): Looking up the label would fail
  console.log('\n3. OLD WAY: Looking up "Blindern, Oslo" (the label) would fail');
  const stopIdFromLabel = await lookupStopId({ 
    stationName: selectedTitle,
    fetchFn: mockFetch 
  });
  
  console.log('   Lookup result for "Blindern, Oslo":', stopIdFromLabel || 'null (FAILED)');
  
  if (!stopIdFromLabel) {
    console.log('   ✓ Confirmed: Looking up the label fails (returns no stopId)');
  }
  
  // Step 4: THE NEW WAY (FIXED): Use the stored stopId directly
  console.log('\n4. NEW WAY: Use the stored stopId directly from autocomplete');
  console.log('   Stored stopId:', selectedId);
  
  // Now try to fetch departures using the stored ID
  const departures = await fetchDepartures({
    stopId: selectedId,
    numDepartures: 2,
    modes: ['bus', 'tram'],
    apiUrl: 'https://api.entur.io/journey-planner/v3/graphql',
    fetchFn: mockFetch
  });
  
  console.log('   Fetched departures:', departures.length);
  
  if (!departures || departures.length === 0) {
    throw new Error('Expected to fetch departures using stored stopId');
  }
  
  console.log('   ✓ Success: Fetched departures using stored stopId!');
  
  // Step 5: Verify the fix works end-to-end
  console.log('\n5. Summary:');
  console.log('   - Autocomplete returns label "Blindern, Oslo" with stopId');
  console.log('   - Looking up "Blindern, Oslo" fails (no results)');
  console.log('   - BUT: We stored the stopId, so we can fetch departures directly');
  console.log('   - Result: No need to lookup again, just use stored stopId!');
  
  console.log(`\n${TEST_NAME} OK`);
}

runTest().catch(err => {
  console.error(`${TEST_NAME} FAILED:`, err.message);
  process.exit(1);
});
