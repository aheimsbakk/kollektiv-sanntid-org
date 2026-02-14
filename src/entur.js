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
    // attempt to normalize a transport mode token from the raw call for UI convenience
    const detectModeFromRaw = (raw) => {
      if (!raw) return null;
      const normalize = (v) => {
        if (v == null) return null;
        if (typeof v === 'string') return v;
        if (typeof v === 'object'){
          if (typeof v.value === 'string') return v.value;
          if (typeof v.id === 'string') return v.id;
          if (typeof v.name === 'string') return v.name;
        }
        return null;
      };
      const tokens = ['bus','buss','tram','trikk','metro','t-bane','tbane','subway','underground','rail','train','tog','s-tog','water','ferry','ferje','boat','ship','coach'];
      // shallow fields
      const shallow = ['transportMode','mode','serviceType','product','transportSubmode','vehicleMode','type'];
      for (const k of shallow){
        try{
          const v = raw[k];
          const n = normalize(v);
          if (n){
            const low = n.toLowerCase();
            for (const t of tokens) if (low.includes(t)) return t;
          }
        }catch(e){}
      }
      // recursive scan for token in keys/values
      const seen = new Set();
      const stack = [raw];
      while(stack.length){
        const cur = stack.pop();
        if (!cur || seen.has(cur)) continue;
        seen.add(cur);
        if (typeof cur === 'string'){
          const low = cur.toLowerCase();
          for (const t of tokens) if (low.includes(t)) return t;
          continue;
        }
        if (Array.isArray(cur)){
          for (const it of cur) stack.push(it);
          continue;
        }
        if (typeof cur === 'object'){
          for (const k of Object.keys(cur)){
            try{ const lk = String(k).toLowerCase(); for (const t of tokens) if (lk.includes(t)) return t; }catch(e){}
            try{ stack.push(cur[k]); }catch(e){}
          }
        }
      }
      return null;
    };

    const mode = detectModeFromRaw(call);
    return {destination, expectedDepartureISO, situations, raw: call, mode};
  });
}

// Lightweight fetch wrapper (optional). Not used by unit tests.
export async function fetchDepartures({stopId, numDepartures=2, modes=['bus'], apiUrl, clientName='personal-js-app', fetchFn=fetch}){
  if (!stopId) throw new Error('stopId required');
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
    const { includeModes = false, modesLiteral = '', useVariables = false, variableValues = null } = opts;
    const modesPart = includeModes ? (useVariables ? `, whiteListedModes: $modes` : `, whiteListedModes: [${modesLiteral}]`) : '';
    const varSig = useVariables && includeModes ? '($modes: [TransportMode!])' : '';
    const query = `query ${varSig} {
    stopPlace(id: "${stopId}") {
      estimatedCalls(numberOfDepartures: ${numDepartures}${modesPart}) {
        expectedDepartureTime
        destinationDisplay { frontText }
        situations { description { value language } }
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
  let json, resp, usedVariant = null;
  // store last request/response for debug UI
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
  // attach a debug snapshot to global so UI can pick it up (if present)
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
