// Test that searchStations returns "Støren stasjon" for query "Støren"
// This verifies the fix for fuzzy matching issues where geocoder ranks
// "Storeng" higher than "Støren stasjon"

import { searchStations } from '../src/entur/index.js';

const testStorenAutocomplete = async () => {
  console.log('Testing autocomplete for "Støren"...');
  
  // Search for just "Støren" (not "Støren M")
  const results = await searchStations({ 
    text: 'Støren', 
    limit: 5,
    fetchFn: fetch 
  });
  
  console.log(`Found ${results.length} transport stops for "Støren"`);
  
  // Log all results
  results.forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.title} (${r.id})`);
  });
  
  // Check if "Støren stasjon" is in the results
  const storenStation = results.find(r => 
    r.id === 'NSR:StopPlace:60077' || 
    (r.title && r.title.includes('Støren stasjon'))
  );
  
  if (storenStation) {
    console.log('✓ Success: "Støren stasjon" found in autocomplete results');
    return true;
  } else {
    console.log('✗ Failed: "Støren stasjon" NOT found in autocomplete results');
    console.log('  This means users typing "Støren" won\'t see the station');
    return false;
  }
};

// Run test
testStorenAutocomplete().then(success => {
  if (!success) process.exit(1);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
