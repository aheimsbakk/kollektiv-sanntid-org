// Parsing utilities for Entur GraphQL responses
export function parseEnturResponse(json){
  if(!json || !json.data || !json.data.stopPlace) return [];
  const calls = json.data.stopPlace.estimatedCalls || [];
  return calls.map(call => {
    const destination = call.destinationDisplay && call.destinationDisplay.frontText ? call.destinationDisplay.frontText : '';
    const expectedDepartureISO = call.expectedDepartureTime || null;
    // Parse realtime fields per docs/journyplanner.md
    const realtime = call.realtime === true;
    const aimedDepartureISO = call.aimedDepartureTime || null;
    const actualDepartureISO = call.actualDepartureTime || null;
    const cancellation = call.cancellation === true;
    const predictionInaccurate = call.predictionInaccurate === true;
    // Extract quay/platform information
    const quay = call.quay ? {
      id: call.quay.id || null,
      publicCode: call.quay.publicCode || null
    } : null;
    // Extract situation text (prefer Norwegian 'no'/'nob', also check summary field)
    const situations = [];
    if (Array.isArray(call.situations) && call.situations.length){
      call.situations.forEach(s => {
        // Check description first (more detailed)
        if (s && Array.isArray(s.description)){
          const found = s.description.find(d => d.language === 'no' || d.language === 'nob') || s.description[0];
          if(found && found.value) situations.push(found.value);
        }
        // Also check summary if no description was found
        else if (s && Array.isArray(s.summary)){
          const found = s.summary.find(d => d.language === 'no' || d.language === 'nob') || s.summary[0];
          if(found && found.value) situations.push(found.value);
        }
      });
    }
    // attempt to normalize a transport mode token from the raw call for UI convenience
    const detectModeFromRaw = (raw) => {
      if (!raw) return null;
      const extractString = (v) => {
        if (v == null) return null;
        if (typeof v === 'string') return v;
        if (typeof v === 'object'){
          if (typeof v.value === 'string') return v.value;
          if (typeof v.id === 'string') return v.id;
          if (typeof v.name === 'string') return v.name;
        }
        return null;
      };

      // map many possible tokens to a small set of canonical modes used by the UI
      const canonicalMap = new Map([
        ['bus', 'bus'], ['buss', 'bus'], ['coach', 'coach'],
        ['tram', 'tram'], ['trikk', 'tram'],
        ['metro', 'metro'], ['t-bane', 'metro'], ['tbane', 'metro'], ['subway', 'metro'], ['underground', 'metro'],
        ['rail', 'rail'], ['train', 'rail'], ['tog', 'rail'], ['s-tog', 'rail'],
        ['water', 'water'], ['ferry', 'water'], ['ferje', 'water'], ['boat', 'water'], ['ship', 'water']
      ]);

      const tokens = Array.from(canonicalMap.keys());
      const shallow = ['transportMode','mode','serviceType','product','transportSubmode','vehicleMode','type'];

      // check explicit likely fields first
      for (const k of shallow){
        try{
          const v = raw[k];
          const s = extractString(v);
          if (s){
            const low = s.toLowerCase();
            for (const t of tokens) if (low.includes(t)) return canonicalMap.get(t);
          }
        }catch(e){}
      }

      // recursive scan for token in keys/values (fallback)
      const seen = new Set();
      const stack = [raw];
      while(stack.length){
        const cur = stack.pop();
        if (!cur || seen.has(cur)) continue;
        seen.add(cur);
        if (typeof cur === 'string'){
          const low = cur.toLowerCase();
          for (const t of tokens) if (low.includes(t)) return canonicalMap.get(t);
          continue;
        }
        if (Array.isArray(cur)){
          for (const it of cur) stack.push(it);
          continue;
        }
        if (typeof cur === 'object'){
          for (const k of Object.keys(cur)){
            try{ const lk = String(k).toLowerCase(); for (const t of tokens) if (lk.includes(t)) return canonicalMap.get(t); }catch(e){}
            try{ stack.push(cur[k]); }catch(e){}
          }
        }
      }
      return null;
    };

    // Prefer explicit server-provided fields when present (explicit path checks)
    const mapTokenToCanonical = (tok) => {
      if (!tok) return null;
      const s = String(tok).toLowerCase();
      if (s.includes('bus') || s === 'bus') return 'bus';
      if (s.includes('tram') || s === 'trikk' || s === 'tram') return 'tram';
      if (s.includes('metro') || s.includes('t-bane') || s === 'metro') return 'metro';
      if (s.includes('rail') || s.includes('train') || s === 'rail') return 'rail';
      if (s.includes('ferry') || s.includes('water') || s === 'ferry') return 'water';
      if (s.includes('coach') || s === 'coach') return 'coach';
      return null;
    };

    // explicit paths to check (preferred)
    let explicitMode = null;
    try{
      const sj = call.serviceJourney;
      if (sj){
        // path: serviceJourney.journeyPattern.line.transportMode
        const jpLineMode = sj.journeyPattern && sj.journeyPattern.line && sj.journeyPattern.line.transportMode;
        if (jpLineMode) explicitMode = mapTokenToCanonical(jpLineMode);
        // path: serviceJourney.journey.transportMode
        if (!explicitMode && sj.journey){
          const jMode = sj.journey.transportMode || (sj.journey.transport && sj.journey.transport.transportMode) || null;
          if (jMode) explicitMode = mapTokenToCanonical(jMode);
        }
        // path: serviceJourney.journeyPattern.line.publicCode -> sometimes indicates tram/metro by line prefixes
        if (!explicitMode && sj.journeyPattern && sj.journeyPattern.line && sj.journeyPattern.line.publicCode){
          const pc = String(sj.journeyPattern.line.publicCode).toLowerCase();
          // heuristics: numeric lines > 10 often buses/coaches, short codes like T or M might indicate metro/tram
          if (pc.startsWith('t') || pc.startsWith('m')) explicitMode = pc.startsWith('t') ? 'tram' : 'metro';
        }
      }
    }catch(e){ explicitMode = null; }

    const mode = explicitMode || detectModeFromRaw(call);
    return {
      destination, 
      expectedDepartureISO, 
      situations, 
      raw: call, 
      mode,
      // New realtime fields
      realtime,
      aimedDepartureISO,
      actualDepartureISO,
      cancellation,
      predictionInaccurate,
      quay
    };
  });
}

// Lightweight fetch wrapper (optional). Not used by unit tests.
export async function fetchDepartures({stopId, numDepartures=2, modes=['bus'], apiUrl='https://api.entur.io/journey-planner/v3/graphql', clientName='personal-js-app', fetchFn=fetch}){
  if (!stopId) throw new Error('stopId required');
  if (!apiUrl) throw new Error('apiUrl required');
  // Simple in-memory cache keyed by stopId+num+modes+apiUrl
  const cacheKey = `${stopId}::${numDepartures}::${modes.join(',')}::${apiUrl}`;
  if(!globalThis._enturCache) globalThis._enturCache = new Map();
  // Only use the cache for real network fetches (when fetchFn === global fetch)
  const useCache = (fetchFn === fetch);
  if(useCache && globalThis._enturCache.has(cacheKey)) return globalThis._enturCache.get(cacheKey);
  // Build query variants. Server GraphQL is strict about argument AST types, and
  // we've observed that different shapes change results. Try multiple forms in
  // a safe order: 1) no whiteListedModes (no filtering), 2) single-string form
  // (mimics original shell expansion), 3) quoted-array form (strings), 4)
  // unquoted-enum-like form (BUS,TRAM...).
  const modesSingleLiteral = `"${modes.join(', ')}"`;
  const modesQuotedArrayLiteral = modes.map(m => `"${m}"`).join(',');
  // Prepare variables and enum literal forms (lower and upper) to try.
  const modesVarsLower = modes.map(m => String(m).toLowerCase());
  const modesVarsUpper = modes.map(m => String(m).toUpperCase());
  const modesEnumArrayLiteralLower = modesVarsLower.join(',');
  const modesEnumArrayLiteralUpper = modesVarsUpper.join(',');

  // Build GraphQL operation. If opts.useVariables is true we inject a $modes
  // variable into the operation signature and reference it in place of an
  // inline literal. We always return { query, variables } where variables may
  // be null.
  const buildQuery = (opts = {}) => {
    const { includeModes = false, modesLiteral = '', useVariables = false, variableValues = null, includeModeFields = false } = opts;
    const modesPart = includeModes ? (useVariables ? `, whiteListedModes: $modes` : `, whiteListedModes: [${modesLiteral}]`) : '';
    const varSig = useVariables && includeModes ? '($modes: [TransportMode!])' : '';
    // Request all real-time fields per docs/journyplanner.md:
    // realtime, aimedDepartureTime, expectedDepartureTime, actualDepartureTime,
    // cancellation, predictionInaccurate, quay info, and situations
    const modeFields = includeModeFields ? `
        serviceJourney {
          journeyPattern { 
            line { publicCode transportMode }
          }
        }` : '';
    const query = `query ${varSig} {
    stopPlace(id: "${stopId}") {
      id
      name
      estimatedCalls(numberOfDepartures: ${numDepartures}${modesPart}, includeCancelledTrips: true) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        actualDepartureTime
        cancellation
        predictionInaccurate
        destinationDisplay { frontText }
        quay {
          id
          publicCode
        }
        situations {
          summary {
            value
            language
          }
          description {
            value
            language
          }
        }${modeFields}
      }
    }
  }`;
    return { query, variables: useVariables && variableValues ? { modes: variableValues } : null };
  };

  // helper to POST and parse safely
  async function postAndParse(q, variables = null){
    const payload = variables ? { query: q, variables } : { query: q };
    const resp = await fetchFn(apiUrl, {method:'POST', headers:{'Content-Type':'application/json','ET-Client-Name':clientName}, body: JSON.stringify(payload)});
    if (!resp) throw new Error('Empty response from fetch');
    if (typeof resp.ok !== 'undefined' && resp.ok === false) {
      const txt = typeof resp.text === 'function' ? await resp.text().catch(()=>'<no body>') : '<no body>';
      throw new Error(`Network error: ${resp.status || 'unknown'} ${resp.statusText || ''} - ${String(txt).slice(0,200)}`);
    }
    const contentType = (resp.headers && (typeof resp.headers.get === 'function') ) ? resp.headers.get('content-type') : (resp.headers && (resp.headers['content-type'] || resp.headers['Content-Type'])) || '';
    if (contentType && !/application\/json/i.test(contentType)){
      const txt = typeof resp.text === 'function' ? await resp.text().catch(()=>'<no body>') : '<no body>';
      throw new SyntaxError(`Non-JSON response: ${String(txt).slice(0,200)}`);
    }
    let json;
    try { json = await resp.json(); } catch (err){ throw new SyntaxError(`Failed to parse JSON response: ${err && err.message ? err.message : String(err)}`); }
    return { json, resp };
  }

   // Try multiple query forms until one returns departures: no-filter first,
   // then single-string, then quoted-array, then enum-like array. Capture
  // the last request/response snippet for debug panels when available.
  // If caller supplied modes, prefer queries that include whiteListedModes.
  // Try variable-based forms first (lowercase then uppercase), then inline
  // literal forms. Finally fall back to no-filter.
   let variants;
  if (Array.isArray(modes) && modes.length > 0){
    variants = [
      { name: 'vars-lower', opts: { includeModes: true, useVariables: true, variableValues: modesVarsLower } },
      { name: 'vars-upper', opts: { includeModes: true, useVariables: true, variableValues: modesVarsUpper } },
      { name: 'single-string', opts: { includeModes: true, modesLiteral: modesSingleLiteral } },
      { name: 'quoted-array', opts: { includeModes: true, modesLiteral: modesQuotedArrayLiteral } },
      { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: modesEnumArrayLiteralLower } },
      { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: modesEnumArrayLiteralUpper } },
      { name: 'no-filter', opts: { includeModes: false } }
    ];
  } else {
    variants = [
      { name: 'no-filter', opts: { includeModes: false } },
      { name: 'vars-lower', opts: { includeModes: true, useVariables: true, variableValues: modesVarsLower } },
      { name: 'vars-upper', opts: { includeModes: true, useVariables: true, variableValues: modesVarsUpper } },
      { name: 'single-string', opts: { includeModes: true, modesLiteral: modesSingleLiteral } },
      { name: 'quoted-array', opts: { includeModes: true, modesLiteral: modesQuotedArrayLiteral } },
      { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: modesEnumArrayLiteralLower } },
      { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: modesEnumArrayLiteralUpper } }
    ];
  }
  // Also try extended selection variants that request candidate transport-mode fields.
  // These are tried first; if the server rejects them we fall back to the simpler selection.
  const extendedVariants = variants.map(v => ({ name: 'ext-'+v.name, opts: Object.assign({}, v.opts, { includeModeFields: true }) }));
  // Final ordered list: extended variants first, then base variants
  variants = extendedVariants.concat(variants);
  let json, resp, usedVariant = null;
   // store last request/response for optional external debug hooks
   let lastDebug = { request: null, response: null, variant: null };
  // iterate variants, but propagate network/parsing errors (e.g. 5xx) only if they
  // are not recoverable; for validation errors we continue to next variant.
  for (const v of variants){
    const built = buildQuery(v.opts);
    const q = built.query;
    const variables = built.variables;
    lastDebug.request = { variant: v.name, query: q, variables };
    try{
      ({ json, resp } = await postAndParse(q, variables));
      // If GraphQL returned an errors array, treat it as a validation/AST
      // error for this variant and continue to next variant.
      if (json && Array.isArray(json.errors) && json.errors.length){
        const errMsg = (json.errors[0] && json.errors[0].message) ? json.errors[0].message : JSON.stringify(json.errors);
        lastDebug.error = `graphql-errors: ${String(errMsg).slice(0,300)}`;
        console.debug('fetchDepartures variant returned GraphQL errors, trying next:', v.name, lastDebug.error);
        // attach response metadata and continue to next variant
        let hdrs = {};
        try{ if (resp && resp.headers){ const h = resp.headers; if (typeof h.entries === 'function') hdrs = Object.fromEntries(h.entries()); else if (typeof h.forEach === 'function'){ h.forEach((vv,kk)=>{ hdrs[kk]=vv }) } else if (typeof h === 'object') hdrs = { ...h }; } }catch(e){}
        lastDebug.response = { status: resp && (resp.status || resp.statusText) ? (resp.status || resp.statusText) : 'unknown', headers: hdrs };
        lastDebug.variant = v.name;
        continue;
      }
      usedVariant = v.name;
      // normalize headers into a plain object for debug UI
      let hdrs = {};
      try{
        if (resp && resp.headers){
          const h = resp.headers;
          if (typeof h.get === 'function' && typeof h.entries === 'function'){
            hdrs = Object.fromEntries(h.entries());
          } else if (typeof h.forEach === 'function'){
            // some implementations expose forEach(cb, thisArg)
            h.forEach((v,k)=>{ hdrs[k]=v });
          } else if (typeof h === 'object'){
            hdrs = { ...h };
          }
        }
      }catch(e){ hdrs = {}; }
      lastDebug.response = { status: resp && (resp.status || resp.statusText) ? (resp.status || resp.statusText) : 'unknown', headers: hdrs };
      lastDebug.variant = v.name;
      // if we got a JSON payload, stop trying other variants and parse below
      break;
    }catch(err){
      // If the error is a SyntaxError from non-JSON body or JSON parse failure,
      // bubble it up since that's likely a real network/proxy problem.
      if (err instanceof SyntaxError) throw err;
      // If GraphQL returns validation errors (bad AST), postAndParse will have
      // returned JSON with an errors array; but some fetch implementations throw
      // earlier. In any case, continue to next variant for validation issues.
      // Attach a small debug note and continue.
      console.debug('fetchDepartures variant failed, trying next:', v.name, String(err).slice(0,200));
      lastDebug.error = String(err).slice(0,300);
      continue;
    }
  }
  if(!resp) throw new Error('Empty response from fetch');
  if (!resp) throw new Error('Empty response from fetch');
  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    // try to extract any text body for diagnosis
    const txt = typeof resp.text === 'function' ? await resp.text().catch(()=>'<no body>') : '<no body>';
    throw new Error(`Network error: ${resp.status || 'unknown'} ${resp.statusText || ''} - ${String(txt).slice(0,200)}`);
  }
  // Check content type when available to avoid JSON.parse on HTML error pages
  const contentType = (resp.headers && (typeof resp.headers.get === 'function') ) ? resp.headers.get('content-type') : (resp.headers && (resp.headers['content-type'] || resp.headers['Content-Type'])) || '';
  if (contentType && !/application\/json/i.test(contentType)){
    const txt = typeof resp.text === 'function' ? await resp.text().catch(()=>'<no body>') : '<no body>';
    throw new SyntaxError(`Non-JSON response: ${String(txt).slice(0,200)}`);
  }
  let parsed = parseEnturResponse(json);
  // If caller requested modes, apply a client-side permissive filter over the
  // parsed results to ensure UI matches user selection even when server AST
  // shapes differ or the server returns unfiltered data. This searches the
  // raw call object for any string values that match a requested mode.
  function rawMatchesModes(rawObj, modesArr){
    if (!rawObj) return false;
    const lowerModes = modesArr.map(m=>String(m).toLowerCase());
    const stack = [rawObj];
    while(stack.length){
      const cur = stack.pop();
      if (cur == null) continue;
      if (typeof cur === 'string'){
        const v = cur.toLowerCase();
        for (const mm of lowerModes) if (v === mm) return true;
        continue;
      }
      if (typeof cur === 'object'){
        if (Array.isArray(cur)){
          for (const it of cur) stack.push(it);
        } else {
          for (const k of Object.keys(cur)) stack.push(cur[k]);
        }
      }
    }
    return false;
  }
  // Only apply client-side filtering when we fell back to a no-filter query on
  // the server. If the usedVariant already included a modes filter, trust the
  // server results.
  if (Array.isArray(modes) && modes.length>0 && usedVariant === 'no-filter'){
    try{
      parsed = parsed.filter(p => rawMatchesModes(p.raw, modes));
    }catch(e){/* ignore filtering errors */}
  }
  if (usedVariant) console.debug('fetchDepartures used variant:', usedVariant);
   // attach a debug snapshot to a developer-provided hook if present
   try{ if (typeof window !== 'undefined' && window.__ENTUR_DEBUG_PANEL__) window.__ENTUR_DEBUG_PANEL__(lastDebug); }catch(e){}
  if(Array.isArray(parsed) && parsed.length===0){
    try{
      const txt = typeof resp.text === 'function' ? await resp.text().catch(()=>'<no body>') : '<no body>';
      console.warn('Entur returned 0 departures; response snippet:', String(txt).slice(0,200), 'variant:', usedVariant);
    }catch(e){/*ignore*/}
  }
  if(useCache) globalThis._enturCache.set(cacheKey, parsed);
  return parsed;
}

// Helper: lookup stopId by station name using Entur geocoder
export async function lookupStopId({stationName, apiUrl='https://api.entur.io/journey-planner/v3/graphql', clientName='personal-js-app', fetchFn=fetch, geocodeUrl='https://api.entur.io/geocoder/v1/autocomplete'}){
  if(!stationName) throw new Error('stationName required');
  // Use geocoder endpoint
  const url = `${geocodeUrl}?text=${encodeURIComponent(stationName)}&lang=no`;
  const r = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });
  if (!r) return null;
  if (typeof r.ok !== 'undefined' && r.ok === false) return null;
  // check content-type
  const contentType = (r.headers && (typeof r.headers.get === 'function')) ? r.headers.get('content-type') : (r.headers && (r.headers['content-type'] || r.headers['Content-Type'])) || '';
  if (contentType && !/application\/json/i.test(contentType)) return null;
  try{
    const j = await r.json();
    const id = j && j.features && j.features[0] && j.features[0].properties && j.features[0].properties.id;
    return id || null;
  }catch(e){
    return null;
  }
}

// Helper: map transport modes to geocoder categories per docs/geocoder.md
function mapModesToGeocoderCategories(modes){
  if (!Array.isArray(modes) || modes.length === 0) return null;
  const categoryMap = {
    'bus': ['onstreetBus', 'busStation', 'coachStation'],
    'tram': ['onstreetTram', 'tramStation'],
    'metro': ['metroStation'],
    'rail': ['railStation'],
    'water': ['harbourPort', 'ferryPort', 'ferryStop']
  };
  const categories = new Set();
  modes.forEach(mode => {
    const m = String(mode).toLowerCase();
    if (categoryMap[m]) {
      categoryMap[m].forEach(cat => categories.add(cat));
    }
  });
  return categories.size > 0 ? Array.from(categories).join(',') : null;
}

// New helper: search geocoder and return up to `limit` candidate feature objects
// Note: We intentionally don't filter by layers or categories because:
// 1. The Entur geocoder has bugs with layers=venue + Norwegian chars (e.g., "Støren")
// 2. The Entur geocoder has fuzzy matching issues with categories + Norwegian chars
// 3. Without filters, users see all relevant results (address + venue layers)
// 4. Mode filtering happens server-side when fetching departures anyway
 export async function searchStations({text, limit = 5, modes = null, fetchFn = fetch, clientName = 'personal-js-app', geocodeUrl='https://api.entur.io/geocoder/v1/autocomplete'}){
  if(!text || String(text).trim().length < 1) return [];
  // Request more results from geocoder (size=50) to work around fuzzy matching issues
  // where stations like "Støren stasjon" rank lower than "Storeng" for query "Støren"
  // We'll filter client-side to show only transport stops and return the requested limit
  const fetchSize = Math.max(50, limit * 10);
  const url = `${geocodeUrl}?text=${encodeURIComponent(text)}&lang=no&size=${fetchSize}`;
  try{
    const r = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });
    if (!r) return [];
    if (typeof r.ok !== 'undefined' && r.ok === false) return [];
    const contentType = (r.headers && (typeof r.headers.get === 'function')) ? r.headers.get('content-type') : (r.headers && (r.headers['content-type'] || r.headers['Content-Type'])) || '';
    if (contentType && !/application\/json/i.test(contentType)) return [];
    const j = await r.json();
    if (!j || !Array.isArray(j.features)) return [];
    // Filter to only transport stops (venue layer only)
    // This prevents address/place results from appearing, even if they have NSR: IDs
    // (e.g., "Stryn" has NSR:GroupOfStopPlaces:106 but layer="address")
    const transportStops = j.features.filter(f => {
      const props = f && f.properties;
      if (!props) return false;
      const layer = props.layer;
      // Only include venue layer results (actual transport stops/stations)
      return layer === 'venue';
    });
    
    // Re-rank results to prioritize closer matches to the search query
    // This helps "Støren stasjon" rank higher than "Storeng" when searching "Støren"
    const queryLower = text.toLowerCase();
    const scoredStops = transportStops.map(f => {
      const name = (f.properties.name || '').toLowerCase();
      const label = (f.properties.label || '').toLowerCase();
      
      // Calculate relevance score (higher is better)
      let score = 0;
      
      // Exact match on name gets highest score
      if (name === queryLower) score += 1000;
      // Starts with query gets high score
      else if (name.startsWith(queryLower)) score += 500;
      // Contains query gets medium score
      else if (name.includes(queryLower)) score += 100;
      
      // Also check label
      if (label.startsWith(queryLower)) score += 50;
      else if (label.includes(queryLower)) score += 10;
      
      return { feature: f, score };
    });
    
    // Sort by score descending, then keep original order for ties
    scoredStops.sort((a, b) => b.score - a.score);
    
    // Map features into a lightweight candidate shape consumed by the UI
    return scoredStops.slice(0, limit).map(({ feature: f }) => ({ id: f && f.properties && f.properties.id ? f.properties.id : null, title: f && f.properties && (f.properties.label || f.properties.name || f.properties.title) ? (f.properties.label || f.properties.name || f.properties.title) : (f && f.text ? f.text : ''), raw: f }));
  }catch(e){
    return [];
  }
}
