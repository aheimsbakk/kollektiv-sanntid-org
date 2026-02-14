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
  // attach header controls into header-wrap; fall back to append if structure differs
  const headerWrap = board.el.headerWrap || board.el.querySelector('.header-wrap') || board.el;
  headerWrap.appendChild(headerControls.el);

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
        if(!fresh || !fresh.length) fresh = await getDemoData();
        renderDepartures(board.list, fresh);
      }catch(e){ console.warn('Manual refresh failed', e); }
    })();
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
  // Wire up entur debug callback so fetchDepartures can populate the debug panel
  try{
    if(board.debug){
      // export a small global callback used by entur.fetchDepartures
      window.__ENTUR_DEBUG_PANEL__ = (snapshot) => {
        // snapshot may contain request, response, variant, error
        const display = {
          variant: snapshot && snapshot.variant,
          request: snapshot && snapshot.request && ({ variant: snapshot.request.variant, query: (snapshot.request.query||'').slice(0,200) }),
          response: snapshot && snapshot.response && snapshot.response.status,
          error: snapshot && snapshot.error
        };
        board.debug.setDebug(display);
      };
    }
  }catch(e){/*ignore*/}
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
    data = await getDemoData();
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
