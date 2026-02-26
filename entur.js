/**
 * entur.js — Entur API client
 *
 * Provides three public functions:
 *   parseEnturResponse(json)   — parse a raw GraphQL response into departure objects
 *   fetchDepartures(opts)      — POST to the Entur journey-planner GraphQL endpoint
 *   lookupStopId(opts)         — look up a stop-place ID by station name (geocoder)
 *   searchStations(opts)       — full-text station autocomplete (geocoder)
 *
 * Design notes:
 * - No third-party dependencies; uses the browser (or injected) fetch.
 * - fetchDepartures tries several GraphQL query shapes in order to work around
 *   strict server-side AST validation of the whiteListedModes argument.
 * - All network/parse errors are surfaced to callers; NO silent failures.
 * - No global caches are used — caching is the caller's responsibility.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Canonical transport-mode map: raw token → UI mode string.
 * Used both for parsing response data and filtering.
 * @type {Map<string, string>}
 */
const CANONICAL_MODE_MAP = new Map([
  ['bus',        'bus'],
  ['buss',       'bus'],
  ['coach',      'coach'],
  ['tram',       'tram'],
  ['trikk',      'tram'],
  ['metro',      'metro'],
  ['t-bane',     'metro'],
  ['tbane',      'metro'],
  ['subway',     'metro'],
  ['underground','metro'],
  ['rail',       'rail'],
  ['train',      'rail'],
  ['tog',        'rail'],
  ['s-tog',      'rail'],
  ['water',      'water'],
  ['ferry',      'water'],
  ['ferje',      'water'],
  ['boat',       'water'],
  ['ship',       'water']
]);

/**
 * Map a single transport-mode token to its canonical UI string.
 * Returns null when the token is not recognised.
 * @param {string|null|undefined} token
 * @returns {string|null}
 */
function mapTokenToCanonical(token) {
  if (!token) return null;
  const lower = String(token).toLowerCase();
  for (const [key, value] of CANONICAL_MODE_MAP) {
    if (lower.includes(key)) return value;
  }
  return null;
}

/**
 * Extract a string value from a possibly object/string field.
 * Handles { value, id, name } shapes returned by the Entur API.
 * @param {*} v
 * @returns {string|null}
 */
function extractString(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (typeof v.value === 'string') return v.value;
    if (typeof v.id    === 'string') return v.id;
    if (typeof v.name  === 'string') return v.name;
  }
  return null;
}

/**
 * Recursively scan an object/array tree for any string value whose lowercase
 * form matches a known transport-mode token. Returns the canonical mode on the
 * first match, or null when nothing matches.
 *
 * This is an intentional fallback used when the preferred explicit field paths
 * in the API response do not contain a usable mode string.
 *
 * @param {*} raw - Arbitrary object from the API response
 * @returns {string|null}
 */
function detectModeFromRaw(raw) {
  if (!raw) return null;

  const tokens = Array.from(CANONICAL_MODE_MAP.keys());

  // Check a small set of well-known shallow fields first (fast path)
  const shallowKeys = ['transportMode', 'mode', 'serviceType', 'product', 'transportSubmode', 'vehicleMode', 'type'];
  for (const k of shallowKeys) {
    const s = extractString(raw[k]);
    if (s) {
      const mode = mapTokenToCanonical(s);
      if (mode) return mode;
    }
  }

  // Recursive deep scan (slow path, runs only when shallow check fails)
  const seen = new Set();
  const stack = [raw];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);

    if (typeof cur === 'string') {
      const low = cur.toLowerCase();
      for (const t of tokens) {
        if (low.includes(t)) return CANONICAL_MODE_MAP.get(t);
      }
      continue;
    }
    if (Array.isArray(cur)) {
      for (const item of cur) stack.push(item);
      continue;
    }
    if (typeof cur === 'object') {
      // Check key names themselves for mode hints
      for (const k of Object.keys(cur)) {
        const lk = String(k).toLowerCase();
        for (const t of tokens) {
          if (lk.includes(t)) return CANONICAL_MODE_MAP.get(t);
        }
        stack.push(cur[k]);
      }
    }
  }
  return null;
}

/**
 * Normalise the Content-Type header from various fetch response shapes.
 * Works with Headers objects (browser), plain objects, and test stubs.
 * @param {Response} resp
 * @returns {string}
 */
function getContentType(resp) {
  if (!resp || !resp.headers) return '';
  if (typeof resp.headers.get === 'function') return resp.headers.get('content-type') || '';
  return resp.headers['content-type'] || resp.headers['Content-Type'] || '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a raw Entur GraphQL response into an array of normalised departure
 * objects. Pure function — no side effects, safe to call in unit tests.
 *
 * Each returned object has:
 *   destination          {string}         — front-text of the destination display
 *   publicCode           {string|null}    — line/route number (e.g. "81", "L2")
 *   expectedDepartureISO {string|null}    — ISO-8601 expected departure time
 *   aimedDepartureISO    {string|null}    — ISO-8601 aimed departure time
 *   actualDepartureISO   {string|null}    — ISO-8601 actual departure time
 *   realtime             {boolean}        — true when live tracking data is used
 *   cancellation         {boolean}        — true when trip is cancelled
 *   predictionInaccurate {boolean}        — true when prediction confidence is low
 *   mode                 {string|null}    — canonical transport mode ('bus', 'rail', …)
 *   quay                 {Object|null}    — { id, publicCode } or null
 *   situations           {string[]}       — human-readable service disruption texts
 *   raw                  {Object}         — original call object (kept for downstream filtering)
 *
 * @param {Object} json - Parsed JSON from the GraphQL endpoint
 * @returns {Array<Object>}
 */
export function parseEnturResponse(json) {
  if (!json || !json.data || !json.data.stopPlace) return [];
  const calls = json.data.stopPlace.estimatedCalls || [];

  return calls.map(call => {
    // --- Destination ---
    const destination = call.destinationDisplay?.frontText ?? '';

    // --- Departure times ---
    const expectedDepartureISO   = call.expectedDepartureTime  ?? null;
    const aimedDepartureISO      = call.aimedDepartureTime     ?? null;
    const actualDepartureISO     = call.actualDepartureTime    ?? null;

    // --- Realtime flags ---
    const realtime             = call.realtime             === true;
    const cancellation         = call.cancellation         === true;
    const predictionInaccurate = call.predictionInaccurate === true;

    // --- Quay / platform ---
    const quay = call.quay
      ? { id: call.quay.id ?? null, publicCode: call.quay.publicCode ?? null }
      : null;

    // --- Service disruption texts ---
    // Prefer Norwegian ('no'/'nob') translations; fall back to first available.
    const situations = [];
    if (Array.isArray(call.situations)) {
      for (const s of call.situations) {
        // Check description first (more detailed), then summary
        const source = Array.isArray(s?.description) ? s.description
                     : Array.isArray(s?.summary)     ? s.summary
                     : null;
        if (source) {
          const entry = source.find(d => d.language === 'no' || d.language === 'nob') ?? source[0];
          if (entry?.value) situations.push(entry.value);
        }
      }
    }

    // --- Transport mode ---
    // Prefer explicit server-provided fields; fall back to recursive raw scan.
    let explicitMode = null;
    let publicCode   = null;
    try {
      const sj = call.serviceJourney;
      if (sj) {
        // Extract line number
        publicCode = sj.journeyPattern?.line?.publicCode ?? null;

        // Best path: serviceJourney.journeyPattern.line.transportMode
        const jpLineMode = sj.journeyPattern?.line?.transportMode;
        if (jpLineMode) explicitMode = mapTokenToCanonical(jpLineMode);

        // Fallback path: serviceJourney.journey.transportMode
        if (!explicitMode && sj.journey) {
          const jMode = sj.journey.transportMode
                     ?? sj.journey.transport?.transportMode
                     ?? null;
          if (jMode) explicitMode = mapTokenToCanonical(jMode);
        }

        // Heuristic: line code prefix may hint at mode (last resort)
        if (!explicitMode && publicCode) {
          const pc = String(publicCode).toLowerCase();
          if (pc.startsWith('t')) explicitMode = 'tram';
          else if (pc.startsWith('m')) explicitMode = 'metro';
        }
      }
    } catch (_) {
      explicitMode = null;
      publicCode   = null;
    }

    const mode = explicitMode ?? detectModeFromRaw(call);

    return {
      destination,
      publicCode,
      expectedDepartureISO,
      aimedDepartureISO,
      actualDepartureISO,
      realtime,
      cancellation,
      predictionInaccurate,
      mode,
      quay,
      situations,
      raw: call
    };
  });
}

// ---------------------------------------------------------------------------
// GraphQL query builder
// ---------------------------------------------------------------------------

/**
 * Build a GraphQL query (and optional variables) for fetching departures.
 *
 * @param {string} stopId
 * @param {number} numDepartures
 * @param {Object} opts
 * @param {boolean}  opts.includeModes      - Whether to include whiteListedModes filter
 * @param {string}   opts.modesLiteral      - Inline literal for whiteListedModes (e.g. '"bus","tram"')
 * @param {boolean}  opts.useVariables      - Whether to use a $modes GraphQL variable
 * @param {string[]} opts.variableValues    - Values for the $modes variable
 * @param {boolean}  opts.includeModeFields - Whether to request serviceJourney/line mode fields
 * @returns {{ query: string, variables: Object|null }}
 */
function buildQuery(stopId, numDepartures, opts = {}) {
  const {
    includeModes     = false,
    modesLiteral     = '',
    useVariables     = false,
    variableValues   = null,
    includeModeFields = false
  } = opts;

  const varSig     = (useVariables && includeModes) ? '($modes: [TransportMode!])' : '';
  const modesPart  = includeModes
    ? (useVariables ? ', whiteListedModes: $modes' : `, whiteListedModes: [${modesLiteral}]`)
    : '';

  // Optionally request service-journey/line fields for richer mode detection
  const modeFields = includeModeFields ? `
        serviceJourney {
          transportSubmode
          journeyPattern {
            line { publicCode transportMode transportSubmode }
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
          summary { value language }
          description { value language }
        }${modeFields}
      }
    }
  }`;

  const variables = (useVariables && variableValues) ? { modes: variableValues } : null;
  return { query, variables };
}

/**
 * POST a GraphQL query to the Entur endpoint and parse the JSON response.
 * Throws on network errors and non-JSON responses.
 *
 * @param {string}   apiUrl
 * @param {string}   clientName
 * @param {Function} fetchFn
 * @param {string}   query
 * @param {Object|null} variables
 * @returns {Promise<{ json: Object, resp: Response }>}
 */
async function postAndParse(apiUrl, clientName, fetchFn, query, variables) {
  const payload = variables ? { query, variables } : { query };
  const resp = await fetchFn(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ET-Client-Name': clientName
    },
    body: JSON.stringify(payload)
  });

  if (!resp) throw new Error('Empty response from fetch');

  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new Error(`Network error: ${resp.status ?? 'unknown'} ${resp.statusText ?? ''} — ${String(txt).slice(0, 200)}`);
  }

  const contentType = getContentType(resp);
  if (contentType && !/application\/json/i.test(contentType)) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new SyntaxError(`Non-JSON response: ${String(txt).slice(0, 200)}`);
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    throw new SyntaxError(`Failed to parse JSON response: ${err?.message ?? String(err)}`);
  }

  return { json, resp };
}

/**
 * Build the ordered list of query variants to try for a given modes array.
 *
 * Variants are tried in this order:
 *   1. Extended selection (with serviceJourney fields) + variable modes (lower/upper-case)
 *   2. Extended selection + inline literal modes (various forms)
 *   3. Extended selection + no filter
 *   4. Base selection (same progression)
 *
 * This order ensures the most informative query (extended with mode filter) is
 * tried first; the no-filter fallback is last.
 *
 * @param {string[]} modes
 * @returns {Array<{ name: string, opts: Object }>}
 */
function buildVariants(modes) {
  const modesLower  = modes.map(m => String(m).toLowerCase());
  const modesUpper  = modes.map(m => String(m).toUpperCase());
  const singleLit   = `"${modes.join(', ')}"`;
  const quotedArr   = modes.map(m => `"${m}"`).join(',');
  const enumLower   = modesLower.join(',');
  const enumUpper   = modesUpper.join(',');

  const hasModes = Array.isArray(modes) && modes.length > 0;

  // Core variant list (without extended-mode-fields flag)
  const base = hasModes
    ? [
        { name: 'vars-lower',       opts: { includeModes: true, useVariables: true,  variableValues: modesLower } },
        { name: 'vars-upper',       opts: { includeModes: true, useVariables: true,  variableValues: modesUpper } },
        { name: 'single-string',    opts: { includeModes: true, modesLiteral: singleLit } },
        { name: 'quoted-array',     opts: { includeModes: true, modesLiteral: quotedArr } },
        { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: enumLower } },
        { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: enumUpper } },
        { name: 'no-filter',        opts: { includeModes: false } }
      ]
    : [
        { name: 'no-filter',        opts: { includeModes: false } },
        { name: 'vars-lower',       opts: { includeModes: true, useVariables: true,  variableValues: modesLower } },
        { name: 'vars-upper',       opts: { includeModes: true, useVariables: true,  variableValues: modesUpper } },
        { name: 'single-string',    opts: { includeModes: true, modesLiteral: singleLit } },
        { name: 'quoted-array',     opts: { includeModes: true, modesLiteral: quotedArr } },
        { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: enumLower } },
        { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: enumUpper } }
      ];

  // Prepend extended variants (request serviceJourney/line fields for richer mode info)
  const extended = base.map(v => ({
    name: 'ext-' + v.name,
    opts: { ...v.opts, includeModeFields: true }
  }));

  return [...extended, ...base];
}

// ---------------------------------------------------------------------------
// Public: fetchDepartures
// ---------------------------------------------------------------------------

/**
 * Fetch upcoming departures for a given stop from the Entur journey-planner API.
 *
 * Multiple GraphQL query variants are tried in sequence until one returns valid
 * data. This is required because the server is strict about the AST shape of
 * the whiteListedModes argument and different API versions accept different forms.
 *
 * When the server falls back to the no-filter variant, client-side mode
 * filtering is applied over the parsed results to honour the caller's selection.
 *
 * @param {Object}   opts
 * @param {string}   opts.stopId          - NSR stop-place ID (required)
 * @param {number}   [opts.numDepartures=2]
 * @param {string[]} [opts.modes=['bus']]
 * @param {string}   [opts.apiUrl]        - GraphQL endpoint URL
 * @param {string}   [opts.clientName]    - ET-Client-Name header value
 * @param {Function} [opts.fetchFn=fetch] - Fetch implementation (injectable for tests)
 * @returns {Promise<Array<Object>>}      - Array of normalised departure objects
 * @throws {Error}  On unrecoverable network/parse failures
 */
export async function fetchDepartures({
  stopId,
  numDepartures = 2,
  modes         = ['bus'],
  apiUrl        = 'https://api.entur.io/journey-planner/v3/graphql',
  clientName    = 'personal-js-app',
  fetchFn       = fetch
}) {
  if (!stopId)  throw new Error('stopId required');
  if (!apiUrl)  throw new Error('apiUrl required');

  const variants = buildVariants(modes);

  let json        = null;
  let resp        = null;
  let usedVariant = null;

  // Try each variant; stop as soon as one returns a valid (error-free) payload.
  for (const variant of variants) {
    const { query, variables } = buildQuery(stopId, numDepartures, variant.opts);
    try {
      ({ json, resp } = await postAndParse(apiUrl, clientName, fetchFn, query, variables));

      // If GraphQL returned an errors array, this variant's AST was rejected —
      // continue to the next form.
      if (json && Array.isArray(json.errors) && json.errors.length) {
        json = null;
        resp = null;
        continue;
      }

      usedVariant = variant.name;
      break;
    } catch (err) {
      // Propagate SyntaxErrors (non-JSON / parse failures) immediately — these
      // indicate a real network or proxy problem, not a query shape issue.
      if (err instanceof SyntaxError) throw err;
      // For any other error, try the next variant.
      continue;
    }
  }

  if (!resp) throw new Error('All query variants exhausted — no response received');

  // Verify the final response is healthy (guard against variants that set resp
  // but produced a non-OK status we hadn't checked yet).
  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new Error(`Network error: ${resp.status ?? 'unknown'} ${resp.statusText ?? ''} — ${String(txt).slice(0, 200)}`);
  }

  let parsed = parseEnturResponse(json);

  // When we fell back to the no-filter server query, apply client-side filtering
  // to honour the caller's mode selection (the server returned unfiltered data).
  if (Array.isArray(modes) && modes.length > 0 && usedVariant === 'no-filter') {
    const lowerModes = modes.map(m => String(m).toLowerCase());
    parsed = parsed.filter(p => rawMatchesModes(p.raw, lowerModes));
  }

  if (Array.isArray(parsed) && parsed.length === 0) {
    console.warn('Entur returned 0 departures for stop:', stopId, 'variant used:', usedVariant);
  }

  return parsed;
}

/**
 * Client-side transport-mode filter: return true when the raw call object
 * contains an exact-match string for any of the requested modes.
 *
 * Used only when the server query fell back to no-filter mode.
 *
 * @param {Object}   rawObj    - Raw API call object
 * @param {string[]} lowerModes - Lowercase mode strings to match
 * @returns {boolean}
 */
function rawMatchesModes(rawObj, lowerModes) {
  if (!rawObj) return false;
  const stack = [rawObj];
  while (stack.length) {
    const cur = stack.pop();
    if (cur == null) continue;
    if (typeof cur === 'string') {
      const v = cur.toLowerCase();
      for (const m of lowerModes) if (v === m) return true;
      continue;
    }
    if (typeof cur === 'object') {
      if (Array.isArray(cur)) {
        for (const item of cur) stack.push(item);
      } else {
        for (const k of Object.keys(cur)) stack.push(cur[k]);
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public: lookupStopId
// ---------------------------------------------------------------------------

/**
 * Look up the NSR stop-place ID for a station by name using the Entur geocoder.
 * Returns the ID of the first feature in the response, or null on failure.
 *
 * @param {Object}   opts
 * @param {string}   opts.stationName   - Free-text station name
 * @param {string}   [opts.clientName]
 * @param {Function} [opts.fetchFn]
 * @param {string}   [opts.geocodeUrl]
 * @returns {Promise<string|null>}
 */
export async function lookupStopId({
  stationName,
  clientName  = 'personal-js-app',
  fetchFn     = fetch,
  geocodeUrl  = 'https://api.entur.io/geocoder/v1/autocomplete'
}) {
  if (!stationName) throw new Error('stationName required');

  const url = `${geocodeUrl}?text=${encodeURIComponent(stationName)}&lang=no`;
  const r   = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });

  if (!r)                                               return null;
  if (typeof r.ok !== 'undefined' && r.ok === false)    return null;

  const ct = getContentType(r);
  if (ct && !/application\/json/i.test(ct))             return null;

  try {
    const j = await r.json();
    return j?.features?.[0]?.properties?.id ?? null;
  } catch (_) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public: searchStations
// ---------------------------------------------------------------------------

/**
 * Full-text station autocomplete via the Entur geocoder.
 *
 * Returns up to `limit` candidate objects: { id, title, raw }.
 *
 * Design notes:
 * - We intentionally omit layer/category filters because the Entur geocoder
 *   has known bugs with these filters when Norwegian characters are present
 *   (e.g. "Støren" returns wrong results when categories=busStation is set).
 * - We request a larger result set (size=50) and apply client-side relevance
 *   scoring to surface the best match first.
 * - Only 'venue' layer results (actual transport stops) are kept.
 *
 * @param {Object}   opts
 * @param {string}   opts.text          - Search query (minimum 1 character)
 * @param {number}   [opts.limit=5]     - Maximum results to return
 * @param {Function} [opts.fetchFn]
 * @param {string}   [opts.clientName]
 * @param {string}   [opts.geocodeUrl]
 * @returns {Promise<Array<{ id: string|null, title: string, raw: Object }>>}
 */
export async function searchStations({
  text,
  limit       = 5,
  fetchFn     = fetch,
  clientName  = 'personal-js-app',
  geocodeUrl  = 'https://api.entur.io/geocoder/v1/autocomplete'
}) {
  if (!text || String(text).trim().length < 1) return [];

  // Request more results than needed to compensate for fuzzy-ranking issues
  const fetchSize = Math.max(50, limit * 10);
  const url = `${geocodeUrl}?text=${encodeURIComponent(text)}&lang=no&size=${fetchSize}`;

  try {
    const r = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });
    if (!r)                                               return [];
    if (typeof r.ok !== 'undefined' && r.ok === false)    return [];

    const ct = getContentType(r);
    if (ct && !/application\/json/i.test(ct))             return [];

    const j = await r.json();
    if (!j || !Array.isArray(j.features)) return [];

    // Keep only venue-layer results (actual transport stops, not addresses)
    const venues = j.features.filter(f => f?.properties?.layer === 'venue');

    // Score results by how well the name matches the search query, so that
    // exact/prefix matches rank higher than fuzzy matches from the API.
    const queryLower = text.toLowerCase();
    const scored = venues.map(f => {
      const name  = (f.properties.name  || '').toLowerCase();
      const label = (f.properties.label || '').toLowerCase();
      let score = 0;
      if (name === queryLower)            score += 1000;
      else if (name.startsWith(queryLower)) score +=  500;
      else if (name.includes(queryLower))   score +=  100;
      if (label.startsWith(queryLower))   score +=   50;
      else if (label.includes(queryLower)) score +=   10;
      return { feature: f, score };
    });

    // Stable sort: higher score first, original order preserved on ties
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ feature: f }) => ({
      id:    f?.properties?.id    ?? null,
      title: f?.properties?.label ?? f?.properties?.name ?? f?.properties?.title ?? f?.text ?? '',
      raw:   f
    }));
  } catch (_) {
    return [];
  }
}
