import { DEFAULTS } from './config.js';
import { getDemoData } from './data-loader.js';
import { formatCountdown, isoToEpochMs } from './time.js';
import { createBoardElements, clearList, findKey } from './ui/ui.js';
import { createHeaderToggle } from './ui/header.js';
import { createOptionsPanel } from './ui/options.js';
import { createDepartureNode, updateDepartureCountdown } from './ui/departure.js';
import { fetchDepartures, lookupStopId } from './entur.js';

const ROOT = document.getElementById('app');

function renderDepartures(listEl, items){
  clearList(listEl);
  if (!items || items.length === 0){
    const empty = document.createElement('div'); empty.className = 'empty-state';
    empty.textContent = 'No departures...';
    listEl.appendChild(empty);
    return;
  }
  items.forEach(it => {
    const node = createDepartureNode(it);
    // initial countdown
    updateDepartureCountdown(node, Date.now(), formatCountdown);
    listEl.appendChild(node.container);
  });
}

async function init(){
  const board = createBoardElements(DEFAULTS.STATION_NAME);
  // header controls with gear
  const headerControls = createHeaderToggle(()=>{ opts.open(); });
  // attach header controls into header-wrap; place controls to the right without affecting centering
  const headerWrap = board.el.headerWrap || board.el.querySelector('.header-wrap') || board.el;
  // create a right-side container that will be positioned absolutely so the title remains centered
  const headerRight = document.createElement('div'); headerRight.className='header-right'; headerRight.appendChild(headerControls.el);
  headerWrap.appendChild(headerRight);

  // options panel
  const opts = createOptionsPanel(DEFAULTS, (newOpts)=>{
    // apply new defaults and re-init fetch loop by reloading the page state
    // for now just update the UI and re-run first fetch cycle
    DEFAULTS.STATION_NAME = newOpts.STATION_NAME;
    DEFAULTS.NUM_DEPARTURES = newOpts.NUM_DEPARTURES;
    DEFAULTS.FETCH_INTERVAL = newOpts.FETCH_INTERVAL;
    DEFAULTS.TRANSPORT_MODES = newOpts.TRANSPORT_MODES;
    // update header title (station displayed in header element)
    const headerTitle = board.el.querySelector('.station-title');
    if (headerTitle) headerTitle.textContent = DEFAULTS.STATION_NAME;
    // trigger a manual refresh
    (async ()=>{
      try{
        if(globalThis._enturCache) globalThis._enturCache.clear();
        const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
        let fresh = [];
        if(stopId){
          fresh = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
        }
    // If API returns no departures, show an explicit empty state instead of demo data
    if(!fresh || !fresh.length) fresh = [];
    renderDepartures(board.list, fresh);
      }catch(e){ console.warn('Manual refresh failed', e); }
    })();
    // apply text size immediately
    try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
      document.documentElement.classList.add('text-size-'+(newOpts.TEXT_SIZE || 'large'));
    }catch(e){}
  });
  document.body.appendChild(opts.panel);
  // expose control so header toggle can call opts.open()
  window.__APP_OPTIONS__ = opts;
  // load persisted settings (if any)
  try{
    const saved = localStorage.getItem('departure:settings');
    if (saved){
      const s = JSON.parse(saved);
      // merge into DEFAULTS to preserve keys
    Object.assign(DEFAULTS, s);
    }
  }catch(e){/*ignore*/}
  // apply text size class
  try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
    const size = DEFAULTS.TEXT_SIZE || 'medium'; document.documentElement.classList.add('text-size-'+size);
  }catch(e){}
  // listen for settings changes to update class immediately
  window.__APP_OPTIONS__ = window.__APP_OPTIONS__ || {};
  const prevApply = window.__APP_OPTIONS__.onApply;
  window.__APP_OPTIONS__.onApply = (s)=>{
    try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
    const size = s && s.TEXT_SIZE ? s.TEXT_SIZE : (DEFAULTS.TEXT_SIZE || 'medium');
      document.documentElement.classList.add('text-size-'+size);
    }catch(e){}
    if(typeof prevApply === 'function') prevApply(s);
  };
  // add a global fixed gear in top-right for easy access that toggles the panel
  const gWrap = document.createElement('div'); gWrap.className='global-gear';
  const gBtn = document.createElement('button'); gBtn.className='gear-btn'; gBtn.type='button'; gBtn.innerHTML='&#9881;'; gBtn.title='Settings';
  gBtn.addEventListener('click', ()=> {
    if (opts && typeof opts.open === 'function' && typeof opts.close === 'function'){
      // toggle based on presence of body class
      if (document.body.classList.contains('options-open')) opts.close(); else opts.open();
    } else if (opts && typeof opts.open === 'function') opts.open();
  });
  gWrap.appendChild(gBtn);
  document.body.appendChild(gWrap);
  ROOT.appendChild(board.el);
  // Expose a small debug button that shows emoji detection snapshots for easier discovery
  try{
    const dbgBtn = document.createElement('button'); dbgBtn.className='emoji-debug-btn'; dbgBtn.type='button'; dbgBtn.textContent = '🐞 Debug';
    dbgBtn.title = 'Show emoji detection diagnostics';
    dbgBtn.addEventListener('click', ()=>{
      const existing = document.querySelector('.emoji-debug-panel');
      if (existing){ existing.remove(); return; }
      const panel = document.createElement('div'); panel.className='emoji-debug-panel';
      panel.style.position = 'fixed'; panel.style.left='12px'; panel.style.bottom='12px'; panel.style.zIndex='1400'; panel.style.maxWidth='40vw'; panel.style.maxHeight='40vh'; panel.style.overflow='auto'; panel.style.background='rgba(0,0,0,0.7)'; panel.style.color='var(--fg)'; panel.style.padding='8px'; panel.style.borderRadius='8px';
      const title = document.createElement('div'); title.textContent = 'Emoji diagnostics'; title.style.fontWeight='700'; title.style.marginBottom='6px'; panel.appendChild(title);
      const list = document.createElement('pre'); list.style.whiteSpace='pre-wrap'; list.style.fontSize='12px'; list.style.lineHeight='1.2';
      const snapshots = (typeof window !== 'undefined' && window.__EMOJI_DEBUG__) ? window.__EMOJI_DEBUG__ : [];
      list.textContent = snapshots.length ? JSON.stringify(snapshots, null, 2) : 'No snapshots yet. Reproduce by letting the app fetch live departures.';
      panel.appendChild(list);
      // Capture now control to force an immediate fetch and populate debug snapshots
      const capRow = document.createElement('div'); capRow.style.display='flex'; capRow.style.gap='8px'; capRow.style.marginTop='8px';
      const capBtn = document.createElement('button'); capBtn.type='button'; capBtn.textContent='Capture now'; capBtn.style.cursor='pointer';
      const capStatus = document.createElement('span'); capStatus.style.fontSize='12px'; capStatus.style.opacity='0.9';
      capRow.appendChild(capBtn); capRow.appendChild(capStatus); panel.appendChild(capRow);
      capBtn.addEventListener('click', async ()=>{
        try{
          capStatus.textContent = 'Capturing...';
          // attempt to lookup stop and fetch parsed departures
          const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
          if (!stopId) { capStatus.textContent = 'No stopId found'; return; }
          const items = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
          // ensure window.__EMOJI_DEBUG__ exists
          if (typeof window !== 'undefined') window.__EMOJI_DEBUG__ = window.__EMOJI_DEBUG__ || [];
          const snaps = items && items.length ? items.map(it=>({ time: (new Date()).toISOString(), destination: it.destination || null, parserMode: it.mode || null, transportModeField: it.transportMode || null, detectedMode: null, rawKeys: it.raw ? Object.keys(it.raw).slice(0,8) : [] })) : [];
          if (snaps.length){
            window.__EMOJI_DEBUG__.push(...snaps);
            if (window.__EMOJI_DEBUG__.length > 50) window.__EMOJI_DEBUG__ = window.__EMOJI_DEBUG__.slice(-50);
            list.textContent = JSON.stringify(window.__EMOJI_DEBUG__, null, 2);
            capStatus.textContent = `Captured ${snaps.length}`;
          } else {
            capStatus.textContent = 'No departures returned';
            list.textContent = 'No snapshots yet. Reproduce by letting the app fetch live departures.';
          }
        }catch(err){ capStatus.textContent = 'Capture failed'; list.textContent = String(err); }
      });
      // Dump raw GraphQL response for current stop
      const dumpRow = document.createElement('div'); dumpRow.style.display='flex'; dumpRow.style.gap='8px'; dumpRow.style.marginTop='8px';
      const dumpBtn = document.createElement('button'); dumpBtn.type='button'; dumpBtn.textContent='Dump raw response'; dumpBtn.style.cursor='pointer';
      const dumpStatus = document.createElement('span'); dumpStatus.style.fontSize='12px'; dumpStatus.style.opacity='0.9';
      dumpRow.appendChild(dumpBtn); dumpRow.appendChild(dumpStatus); panel.appendChild(dumpRow);
      dumpBtn.addEventListener('click', async ()=>{
        try{
          dumpStatus.textContent = 'Fetching raw...';
          const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
          if (!stopId){ dumpStatus.textContent = 'No stopId found'; return; }
          // simple no-filter query to inspect server response
          const q = `query { stopPlace(id: "${stopId}") { estimatedCalls(numberOfDepartures: ${DEFAULTS.NUM_DEPARTURES}) { expectedDepartureTime destinationDisplay { frontText } situations { description { value language } } } } }`;
          const resp = await fetch(DEFAULTS.API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ET-Client-Name': DEFAULTS.CLIENT_NAME }, body: JSON.stringify({ query: q }) });
          if (!resp) { dumpStatus.textContent = 'No response'; return; }
          const ct = resp.headers && typeof resp.headers.get === 'function' ? resp.headers.get('content-type') : (resp.headers && (resp.headers['content-type']||resp.headers['Content-Type'])) || '';
          if (ct && !/application\/json/i.test(ct)){
            const txt = await resp.text().catch(()=>'<no body>');
            list.textContent = `Non-JSON response:\n${String(txt).slice(0,2000)}`;
            dumpStatus.textContent = 'Done';
            return;
          }
          const j = await resp.json().catch(async (e)=>{ const t = await resp.text().catch(()=>'<no body>'); throw new Error('JSON parse failed: '+String(t)); });
          list.textContent = JSON.stringify(j, null, 2);
          dumpStatus.textContent = 'Done';
        }catch(err){ dumpStatus.textContent = 'Dump failed'; list.textContent = String(err); }
      });
      document.body.appendChild(panel);
    });
    // place near gear
    document.body.appendChild(dbgBtn);
  }catch(e){}
  // Debugging is disabled by default. To enable, set `window.__ENTUR_DEBUG_PANEL__ = fn` from the console.
  // Try live data first, fall back to demo
  let data = [];
  try{
    const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
    if(stopId && DEFAULTS.API_URL){
      data = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
      if(board.status){ board.status.style.display='inline-block'; board.status.textContent = 'Live'; }
    }
  }catch(e){
    console.warn('Live fetch failed, falling back to demo', e && e.message ? e.message : e);
    if(board.status){ board.status.style.display='inline-block'; board.status.textContent = 'Demo'; }
  }
  if(!data || !data.length){
    // Don't auto-fallback to demo here; show an explicit empty state handled by renderDepartures
    data = [];
  }
  renderDepartures(board.list, data);
  // Start per-second countdown updates (keeps DOM nodes, avoids full re-render)
  function tickCountdowns(){
    const now = Date.now();
    const times = board.list.querySelectorAll('.departure-time');
    times.forEach(t => {
      const v = t.dataset.epochMs;
      // treat empty string or missing dataset as invalid
      const epoch = (v == null || v === '' ) ? NaN : Number(v);
      if (!Number.isFinite(epoch)) { t.textContent = '—'; return; }
      const txt = formatCountdown(epoch, now);
      t.textContent = (txt != null) ? txt : '—';
    });
  }
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
  // if any situation exists show single banner
  const anySitu = data.find(d=>Array.isArray(d.situations) && d.situations.length);
  if(anySitu && board.banner){ board.banner.textContent = anySitu.situations.join('; '); board.banner.style.display = 'block'; }
  // show diagnostics when live fetch returned empty results
  if(board.debug){
    if(board.status && board.status.textContent === 'Live' && data.length===0){
      board.debug.style.display='block';
      board.debug.textContent = 'Live fetch succeeded but returned 0 departures. Possible reasons: remote has no upcoming departures or request params filter results.\nCheck network requests for details.';
    } else {
      board.debug.style.display='none';
    }
  }

  // refresh logic: clear cache and refetch every FETCH_INTERVAL seconds
  setInterval(async ()=>{
    try{
      // clear entur cache to force network refetch
      if(globalThis._enturCache) globalThis._enturCache.clear();
      const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
      let fresh = [];
      if(stopId){
        fresh = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
      }
      if(!fresh || !fresh.length){
        fresh = await getDemoData();
      }
      // re-render for now; later we can diff and patch
      renderDepartures(board.list, fresh);
      data = fresh;
    }catch(err){
      console.warn('Refresh failed', err);
    }
  }, DEFAULTS.FETCH_INTERVAL * 1000);
}

document.addEventListener('DOMContentLoaded', init);
