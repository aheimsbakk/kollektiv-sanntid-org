// Integration test to check if Norwegian characters work with real Entur API
// This test makes real API calls to verify encoding works correctly
import { searchStations, lookupStopId, fetchDepartures } from '../src/entur/index.js';

const TEST_NAME = 'entur.norwegian.real.test.mjs';

async function runTest() {
  console.log(`Running ${TEST_NAME} (uses real Entur API)`);
  
  const clientName = 'test-norwegian-chars';
  
  // Test 1: Search for "Støren" using real API
  console.log('\n1. Searching for "Støren" (real API call)');
  try {
    const candidates = await searchStations({ 
      text: 'Støren',
      limit: 3,
      clientName,
      fetchFn: fetch
    });
    
    console.log(`   Found ${candidates.length} candidates`);
    if (candidates.length > 0) {
      console.log('   First candidate:', candidates[0].title);
      console.log('   Stop ID:', candidates[0].id);
      console.log('   ✓ Search succeeded');
      
      // Test 2: Try to fetch departures for the first result
      if (candidates[0].id) {
        console.log('\n2. Fetching departures for', candidates[0].title);
        try {
          const departures = await fetchDepartures({
            stopId: candidates[0].id,
            numDepartures: 2,
            modes: ['rail', 'bus'],
            clientName,
            fetchFn: fetch
          });
          console.log(`   Found ${departures.length} departures`);
          if (departures.length > 0) {
            console.log('   First departure:', departures[0].destination);
          }
          console.log('   ✓ Departure fetch succeeded');
        } catch (err) {
          console.error('   ✗ Departure fetch failed:', err.message);
          throw err;
        }
      }
    } else {
      console.log('   ⚠ No candidates found (might be a valid result if station does not exist)');
    }
  } catch (err) {
    console.error('   ✗ Search failed:', err.message);
    throw err;
  }
  
  // Test 3: Test lookupStopId with "Støren"
  console.log('\n3. Looking up stopId for "Støren" (real API call)');
  try {
    const stopId = await lookupStopId({
      stationName: 'Støren',
      clientName,
      fetchFn: fetch
    });
    
    if (stopId) {
      console.log('   Stop ID:', stopId);
      console.log('   ✓ Lookup succeeded');
    } else {
      console.log('   ⚠ No stopId found');
    }
  } catch (err) {
    console.error('   ✗ Lookup failed:', err.message);
    throw err;
  }
  
  // Test 4: Test with other Norwegian characters
  console.log('\n4. Testing other Norwegian characters');
  const testStations = ['Tøyen', 'Bjølsen', 'Åsane'];
  
  for (const station of testStations) {
    console.log(`   Searching for "${station}"...`);
    try {
      const results = await searchStations({
        text: station,
        limit: 1,
        clientName,
        fetchFn: fetch
      });
      console.log(`     ${results.length > 0 ? '✓' : '⚠'} ${results.length} result(s)`);
    } catch (err) {
      console.error(`     ✗ Failed: ${err.message}`);
    }
  }
  
  console.log(`\n${TEST_NAME} OK`);
}

// Only run if fetch is available (browser or Node 18+)
if (typeof fetch === 'undefined') {
  console.log(`${TEST_NAME} SKIPPED: fetch not available`);
  process.exit(0);
} else {
  runTest().catch(err => {
    console.error(`${TEST_NAME} FAILED:`, err.message);
    console.error(err.stack);
    process.exit(1);
  });
}
