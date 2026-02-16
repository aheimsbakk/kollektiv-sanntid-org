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
  // load persisted settings (if any) BEFORE building the UI so the station
  // title and options panel reflect saved preferences on startup
  try{
    const saved = localStorage.getItem('departure:settings');
    if (saved){
      const s = JSON.parse(saved);
      // merge into DEFAULTS to preserve keys
      Object.assign(DEFAULTS, s);
    }
  }catch(e){/*ignore*/}

  const board = createBoardElements(DEFAULTS.STATION_NAME);
  // track when the next automatic refresh will occur (epoch ms) so we can
  // show a per-second countdown in the header status chip.
  let nextRefreshAt = Date.now();
  // set when a live fetch has actually contacted the API (used for diagnostics)
  let liveFetchSucceeded = false;
  // id for the refresh interval so we can restart it when FETCH_INTERVAL changes
  let refreshTimerId = null;

  // perform a refresh: fetch live data when possible, optionally fallback to demo
  // fallbackToDemo: when false, leave an explicit empty state if live API returns no items
  async function doRefresh({ fallbackToDemo = true } = {}){
    try{
      if(globalThis._enturCache) globalThis._enturCache.clear();
      const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
      let fresh = [];
      if(stopId){
        fresh = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
        liveFetchSucceeded = true;
      }
      if(!fresh || !fresh.length){
        if (fallbackToDemo) {
          fresh = await getDemoData();
        } else {
          fresh = [];
        }
      }
      renderDepartures(board.list, fresh);
      data = fresh;
    }catch(err){
      console.warn('Refresh failed', err);
    }finally{
      // schedule the next refresh relative to now using the (possibly updated) FETCH_INTERVAL
      nextRefreshAt = Date.now() + (DEFAULTS.FETCH_INTERVAL * 1000);
    }
  }

  // (re)start the automatic refresh loop using the current DEFAULTS.FETCH_INTERVAL
  function startRefreshLoop(){
    try{ if (refreshTimerId) clearInterval(refreshTimerId); }catch(e){}
    nextRefreshAt = Date.now() + (DEFAULTS.FETCH_INTERVAL * 1000);
    refreshTimerId = setInterval(()=>{
      // fire off refresh but don't await here; doRefresh handles its own errors
      doRefresh().catch(err => console.warn('Refresh failed', err));
    }, DEFAULTS.FETCH_INTERVAL * 1000);
  }
  // ensure the browser page title matches the current station name for clarity
  try{ document.title = DEFAULTS.STATION_NAME || document.title; }catch(e){}
  // register service worker and implement an "update available" flow that
  // prompts the user to reload when a new service worker is installed.
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        // helper to show a non-blocking update prompt
        const showUpdatePrompt = (worker) => {
          // avoid creating multiple prompts
          if (document.getElementById('sw-update-toast')) return;
          const toast = document.createElement('div');
          toast.id = 'sw-update-toast';
          toast.className = 'options-toast';
          toast.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><span>New version available</span><div style="display:flex;gap:8px"><button id="sw-refresh-btn">Reload</button><button id="sw-dismiss-btn">Dismiss</button></div></div>`;
          document.body.appendChild(toast);
          const remove = ()=>{ try{ toast.remove(); }catch(e){} };
          document.getElementById('sw-refresh-btn').addEventListener('click', ()=>{
            // ask the waiting worker to skipWaiting, then reload on controllerchange
            if (!worker) return;
            worker.postMessage({type: 'SKIP_WAITING'});
          });
          document.getElementById('sw-dismiss-btn').addEventListener('click', remove);
        };

        // If there's already a waiting worker, prompt immediately
        if (reg && reg.waiting) {
          showUpdatePrompt(reg.waiting);
        }

        // Listen for updates found (new installing worker)
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              // If there's an active controller, this is an update (not first install)
              if (navigator.serviceWorker.controller) {
                showUpdatePrompt(reg.waiting || installing);
              }
            }
          });
        });

        // When the new SW takes control, reload so the user gets the new assets
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      }).catch(()=>{});
    } catch (e) { /* ignore */ }
  }
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
    try{ document.title = DEFAULTS.STATION_NAME || document.title; }catch(e){}
    // trigger a manual refresh (do not fallback to demo for manual refresh)
    (async ()=>{
      try{
        await doRefresh({ fallbackToDemo: false });
      }catch(e){ console.warn('Manual refresh failed', e); }
      // restart periodic refresh loop so it uses the updated FETCH_INTERVAL
      startRefreshLoop();
    })();
    // apply text size immediately
    try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
      document.documentElement.classList.add('text-size-'+(newOpts.TEXT_SIZE || 'large'));
    }catch(e){}
  });
  document.body.appendChild(opts.panel);
  // expose control so header toggle can call opts.open()
  window.__APP_OPTIONS__ = opts;
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
  // Debugging was removed: emoji debug panel and floating debug button are no longer added to the UI.
  // Try live data first, fall back to demo
  let data = [];
  try{
    const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
    if(stopId && DEFAULTS.API_URL){
      // use the new helper to perform the first refresh but do not fallback to demo
      await doRefresh({ fallbackToDemo: false });
      // ensure the status chip is visible; its textContent will be driven by the
      // per-second ticker below to show "Next update in XX seconds."
      if (board.status) {
        board.status.style.display = 'inline-block';
        // give an initial label while the ticker updates on the next tick
        board.status.textContent = 'Live';
      }
    }
  }catch(e){
    console.warn('Live fetch failed, falling back to demo', e && e.message ? e.message : e);
    if(board.status){ board.status.style.display='inline-block'; board.status.textContent = 'Demo'; }
  }
  if(!data || !data.length){
    // Don't auto-fallback to demo here; show an explicit empty state handled by renderDepartures
    data = [];
  }
  // run initial render (doRefresh already rendered when live fetch succeeded)
  if (!data || data.length === 0) renderDepartures(board.list, data);
  // initialise and start the periodic refresh loop
  startRefreshLoop();
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
    // update header status chip with seconds until next automatic refresh (compact)
    if (board.status) {
      const msLeft = (typeof nextRefreshAt === 'number') ? (nextRefreshAt - now) : (DEFAULTS.FETCH_INTERVAL * 1000);
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
      board.status.textContent = `Updating in ${secLeft}s`;
    }
  }
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
  // departure-specific situation lines are shown per-item; global banner removed
  // show diagnostics when live fetch returned empty results
    if (board.debug) {
      if (liveFetchSucceeded && data.length === 0) {
        board.debug.style.display = 'block';
        board.debug.textContent = 'Live fetch succeeded but returned 0 departures. Possible reasons: remote has no upcoming departures or request params filter results.\nCheck network requests for details.';
      } else {
        board.debug.style.display = 'none';
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
        liveFetchSucceeded = true;
      }
      if(!fresh || !fresh.length){
        fresh = await getDemoData();
      }
      // re-render for now; later we can diff and patch
      renderDepartures(board.list, fresh);
      data = fresh;
      // reset next refresh time to FETCH_INTERVAL from now
      nextRefreshAt = Date.now() + (DEFAULTS.FETCH_INTERVAL * 1000);
    }catch(err){
      console.warn('Refresh failed', err);
    }
  }, DEFAULTS.FETCH_INTERVAL * 1000);
}

document.addEventListener('DOMContentLoaded', init);
