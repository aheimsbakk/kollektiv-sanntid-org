// Parsing utilities for Entur GraphQL responses
export function parseEnturResponse(json){
  if(!json || !json.data || !json.data.stopPlace) return [];
  const calls = json.data.stopPlace.estimatedCalls || [];
  return calls.map(call => {
    const destination = call.destinationDisplay && call.destinationDisplay.frontText ? call.destinationDisplay.frontText : '';
    const expectedDepartureISO = call.expectedDepartureTime || null;
    // Extract situation text (prefer Norwegian 'no'/'nob')
    const situations = [];
    if (Array.isArray(call.situations) && call.situations.length){
      call.situations.forEach(s => {
        if (s && Array.isArray(s.description)){
          const found = s.description.find(d => d.language === 'no' || d.language === 'nob') || s.description[0];
          if(found && found.value) situations.push(found.value);
        }
      });
    }
    return {destination, expectedDepartureISO, situations, raw: call};
  });
}

// Lightweight fetch wrapper (optional). Not used by unit tests.
export async function fetchDepartures({stopId, numDepartures=2, modes=['bus'], apiUrl, clientName='personal-js-app', fetchFn=fetch}){
  if (!stopId) throw new Error('stopId required');
  const query = `{
    stopPlace(id: "${stopId}") {
      estimatedCalls(numberOfDepartures: ${numDepartures}, whiteListedModes: ["${modes.join('","')}"]) {
        expectedDepartureTime
        destinationDisplay { frontText }
        situations { description { value language } }
      }
    }
  }`;
  const resp = await fetchFn(apiUrl, {method:'POST', headers:{'Content-Type':'application/json','ET-Client-Name':clientName}, body: JSON.stringify({query})});
  const json = await resp.json();
  return parseEnturResponse(json);
}
