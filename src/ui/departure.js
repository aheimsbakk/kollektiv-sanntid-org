import { PLATFORM_SYMBOLS } from '../config.js';

export function createDepartureNode(item){
  const container = document.createElement('div'); container.className='departure';
  const dest = document.createElement('div'); dest.className='departure-destination';

  // time container (countdown separate)
  const time = document.createElement('div'); time.className='departure-time';
  const timeWrap = document.createElement('div'); timeWrap.className = 'departure-time-wrap';

  // compute epoch ms robustly; store as dataset string only when valid
  const epochMs = (item && item.expectedDepartureISO) ? Date.parse(item.expectedDepartureISO) : NaN;
  if (Number.isFinite(epochMs)) {
    time.dataset.epochMs = String(epochMs);
  } else {
    time.dataset.epochMs = '';
    time.textContent = '—';
  }

  const situ = document.createElement('div'); situ.className='departure-situations'; situ.textContent = (item.situations || []).join('; ');

  // detect mode from various possible fields in the parsed item/raw payload
  const detectMode = () => {
    if (!item) return null;
    // prefer parser-provided normalized mode if available
    if (item.mode) return item.mode;
    if (item.transportMode) return item.transportMode;
    // inspect common shallow fields that may be objects
    const shallowCandidates = ['transportMode','serviceType','product','transportSubmode'];
    for (const k of shallowCandidates){
      const v = item.raw && item.raw[k];
      if (!v) continue;
      if (typeof v === 'string') return v;
      if (typeof v === 'object'){
        if (typeof v.value === 'string') return v.value;
        if (typeof v.id === 'string') return v.id;
        if (typeof v.name === 'string') return v.name;
      }
    }

    // search recursively in raw object for any string value that matches known tokens
    const raw = item.raw;
    if (!raw) return null;
    const tokens = ['bus','tram','metro','rail','train','water','ferry','coach'];

    const matchesToken = (str) => {
      if (!str || typeof str !== 'string') return null;
      const low = str.toLowerCase();
      for (const t of tokens) if (low.includes(t)) return t;
      return null;
    };

    const seen = new Set();
    const stack = [raw];
    while(stack.length){
      const cur = stack.pop();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      // direct string
      if (typeof cur === 'string'){
        const m = matchesToken(cur);
        if (m) return m;
        continue;
      }
      // arrays: enqueue elements
      if (Array.isArray(cur)){
        for (const it of cur) stack.push(it);
        continue;
      }
      if (typeof cur === 'object'){
        // check common properties that may hold mode-like values
        const commonKeys = ['transportMode','mode','serviceType','product','transportSubmode','vehicleMode','type','journeyType'];
        for (const k of commonKeys){
          try{
            const val = cur[k];
            if (val){
              const nm = normalize(val);
              if (nm){ const mm = matchesToken(nm); if (mm) return mm; }
            }
          }catch(e){}
        }
        // otherwise inspect keys and values
        for (const k of Object.keys(cur)){
          const keyMatch = matchesToken(String(k));
          if (keyMatch) return keyMatch;
          try{ stack.push(cur[k]); }catch(e){}
        }
      }
    }
    return null;
  };

  function emojiForMode(mode){
    if(!mode) return '🚆';
    const m = String(mode).toLowerCase();
    if(m.includes('bus')) return '🚌';
    if(m.includes('tram')) return '🚋';
    if(m.includes('metro')) return '🚇';
    if(m.includes('rail') || m.includes('train')) return '🚅';
    if(m.includes('water') || m.includes('ferry')) return '🛳️';
    if(m.includes('coach')) return '🚍';
    return '🚆';
  }

  const mode = detectMode();
  // Diagnostic: if mode not found, log a compact signature of raw once per unique shape
  try{
    if (!mode && item && item.raw){
      try{
        const sigKeys = Object.keys(item.raw).slice(0,8);
        const sig = JSON.stringify(sigKeys);
        if (!_seenRawSignatures.has(sig)){
          _seenRawSignatures.add(sig);
          // store a compact diagnostic snapshot on window for later inspection
              // debug snapshots removed — no-op
          // still log a compact console message for immediacy
          try{ console.warn('emoji-detect: no mode found; raw keys sample:', sigKeys); }catch(e){}
        }
      }catch(e){}
    }
  }catch(e){}
  // render emoji inline with destination text so it wraps naturally on small screens
  const emoji = emojiForMode(mode);
  const destinationText = (item && item.destination) ? String(item.destination) : '—';
  const lineNumber = (item && item.publicCode) ? String(item.publicCode) + ' · ' : '';
  
  // Build platform/quay display with stacked format: {emoji} <span>{symbol}<br>{code}</span>
  // Detect quay type from publicCode format:
  // - Numeric (1-20) = platform (trains, metro)
  // - Letters (A-Z) = gate/stop (buses, trams)
  let platformDisplay = '';
  if (item && item.quay && item.quay.publicCode) {
    const quayCode = String(item.quay.publicCode);
    let quayType = 'default';
    
    // Detect type based on publicCode format
    if (/^\d+$/.test(quayCode)) {
      // Pure numeric = platform (trains, metro)
      quayType = 'platform';
    } else if (/^[A-Z]$/i.test(quayCode)) {
      // Single letter = gate or stop
      // We could differentiate based on mode, but for simplicity use 'gate'
      quayType = mode === 'tram' ? 'stop' : 'gate';
    } else if (mode === 'water' || mode === 'ferry') {
      quayType = 'berth';
    }
    
    const platformSymbol = PLATFORM_SYMBOLS[quayType] || PLATFORM_SYMBOLS.default;
    
    // Create stacked display element
    const stackedSpan = document.createElement('span');
    stackedSpan.className = 'platform-stacked';
    stackedSpan.innerHTML = `<span>${platformSymbol}</span><span>${quayCode}</span>`;
    
    // Store the element for later insertion
    platformDisplay = stackedSpan;
  }
  
  // Build text content and append platform element if present
  const fullText = lineNumber + destinationText + ' ' + emoji;
  try{ 
    dest.textContent = fullText;
    if (platformDisplay) {
      dest.appendChild(platformDisplay);
    }
  } catch(e) { 
    dest.textContent = destinationText; 
  }
  // provide an accessible textual label matching the visual order (destination + mode)
  const readableMode = (m) => {
    if(!m) return '';
    const mm = String(m).toLowerCase();
    if(mm.includes('bus')) return 'Bus';
    if(mm.includes('tram') || mm.includes('trikk')) return 'Tram';
    if(mm.includes('metro') || mm.includes('t-bane') || mm.includes('tbane')) return 'Metro';
    if(mm.includes('rail') || mm.includes('train') || mm.includes('tog')) return 'Train';
    if(mm.includes('water') || mm.includes('ferry') || mm.includes('ferje') || mm.includes('boat')) return 'Ferry';
    if(mm.includes('coach')) return 'Coach';
    return '';
  };
  try{ 
    const platformText = (item && item.quay && item.quay.publicCode) ? (' Platform ' + item.quay.publicCode) : '';
    dest.setAttribute('aria-label', (lineNumber ? 'Line ' + item.publicCode + ' to ' : '') + destinationText + (readableMode(mode) ? (' ' + readableMode(mode)) : '') + platformText); 
  }catch(e){}

  timeWrap.append(time);
  // place situation between destination and countdown so alerts are read in context
  container.append(dest, situ, timeWrap);
  // store references for quick updates
  return {container, dest, time, situ, epochMs: Number.isFinite(epochMs) ? epochMs : null};
}

export function updateDepartureCountdown(node, nowMs = Date.now(), formatFn){
  if (!node || !node.time || !formatFn) return;
  const v = node.time.dataset.epochMs;
  const epoch = (v == null || v === '') ? (node.epochMs || null) : Number(v);
  if (!Number.isFinite(epoch)) { node.time.textContent = '—'; return; }
  const text = formatFn(epoch, nowMs) || '—';
  node.time.textContent = text;
}
