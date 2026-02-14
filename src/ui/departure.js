export function createDepartureNode(item){
  const container = document.createElement('div'); container.className='departure';
  const dest = document.createElement('div'); dest.className='departure-destination'; dest.textContent = item.destination || '—';

  // time and emoji container
  const time = document.createElement('div'); time.className='departure-time';
  const timeWrap = document.createElement('div'); timeWrap.className = 'departure-time-wrap';
  const emojiEl = document.createElement('span'); emojiEl.className = 'departure-emoji';

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
    if(m.includes('coach')) return '🚐';
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
          try{
            if (typeof window !== 'undefined'){
              window.__EMOJI_DEBUG__ = window.__EMOJI_DEBUG__ || [];
              const snapshot = {
                time: (new Date()).toISOString(),
                destination: item.destination || null,
                parserMode: item.mode || null,
                transportModeField: item.transportMode || null,
                detectedMode: mode || null,
                rawKeys: sigKeys,
              };
              window.__EMOJI_DEBUG__.push(snapshot);
              // keep array bounded to prevent unbounded memory growth
              if (window.__EMOJI_DEBUG__.length > 50) window.__EMOJI_DEBUG__.shift();
            }
          }catch(e){}
          // still log a compact console message for immediacy
          try{ console.warn('emoji-detect: no mode found; raw keys sample:', sigKeys); }catch(e){}
        }
      }catch(e){}
    }
  }catch(e){}
  if (typeof emojiEl.setAttribute === 'function') {
    emojiEl.setAttribute('aria-hidden', 'true');
  } else {
    // DOM shim fallback for tests: set a usable property
    try{ emojiEl.ariaHidden = 'true'; }catch(e){}
  }
  emojiEl.textContent = emojiForMode(mode);

  timeWrap.append(emojiEl, time);
  container.append(dest, timeWrap, situ);
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
