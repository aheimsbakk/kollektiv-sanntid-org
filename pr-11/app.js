import { DEFAULTS, VERSION, UI_EMOJIS } from './config.js';
import { formatCountdown, isoToEpochMs } from './time.js';
import { createBoardElements, clearList, findKey, updateFooterTranslations } from './ui/ui.js';
import { createHeaderToggle } from './ui/header.js';
import { createOptionsPanel } from './ui/options.js';
import { createDepartureNode, updateDepartureCountdown } from './ui/departure.js';
import { fetchDepartures, lookupStopId } from './entur.js';
import { initLanguage, t, getLanguage } from './i18n.js';
import { addRecentStation } from './ui/station-dropdown.js';
import { initTheme, createThemeToggle } from './ui/theme-toggle.js';
import { createShareButton, decodeSettings } from './ui/share-button.js';

// Initialize language on startup
initLanguage();

// Initialize theme on startup
initTheme();

const ROOT = document.getElementById('app');

// Update tooltips on global buttons when language changes
function updateGlobalButtonTooltips() {
  if (window.__GLOBAL_BUTTONS__) {
    window.__GLOBAL_BUTTONS__.share.title = t('shareBoard');
    window.__GLOBAL_BUTTONS__.share.setAttribute('aria-label', t('shareBoard'));
    window.__GLOBAL_BUTTONS__.theme.title = t('themeTooltip');
    window.__GLOBAL_BUTTONS__.settings.title = t('settingsTooltip');
  }
}

function renderDepartures(listEl, items){
  clearList(listEl);
  if (!items || items.length === 0){
    const empty = document.createElement('div'); empty.className = 'empty-state';
    empty.textContent = t('noDepartures');
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

  // Check for URL parameters
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Clear cache-busting timestamp parameter if present (from SW update reload)
    if (urlParams.has('t')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Check for shared board URL parameter (?b= or legacy ?board=)
    const boardParam = urlParams.get('b') || urlParams.get('board');
    if (boardParam) {
      const sharedSettings = decodeSettings(boardParam);
      if (sharedSettings) {
        // Apply all decoded settings to DEFAULTS
        DEFAULTS.STATION_NAME = sharedSettings.stationName;
        DEFAULTS.STOP_ID = sharedSettings.stopId;
        DEFAULTS.TRANSPORT_MODES = sharedSettings.transportModes;
        DEFAULTS.NUM_DEPARTURES = sharedSettings.numDepartures;
        DEFAULTS.FETCH_INTERVAL = sharedSettings.fetchInterval;
        DEFAULTS.TEXT_SIZE = sharedSettings.textSize;
        
        // Apply language if valid
        if (sharedSettings.language) {
          try {
            localStorage.setItem('departure:language', sharedSettings.language);
            // Re-initialize language with new setting
            initLanguage();
          } catch(e) {/*ignore*/}
        }
        
        // Add shared board to top of favorites list
        if (sharedSettings.stationName && sharedSettings.stopId) {
          addRecentStation(sharedSettings.stationName, sharedSettings.stopId, sharedSettings.transportModes || [], {
            numDepartures: sharedSettings.numDepartures,
            fetchInterval: sharedSettings.fetchInterval,
            textSize: sharedSettings.textSize,
            language: sharedSettings.language
          });
        }
        
        // Save shared settings to localStorage so they persist after URL is cleaned
        try {
          localStorage.setItem('departure:settings', JSON.stringify(DEFAULTS));
        } catch(e) {/*ignore*/}
        
        // Clear the URL parameter to prevent accidental re-imports
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  } catch(e) {
    console.warn('Failed to decode shared board URL', e);
  }

  // Handler for when user selects a station from recent dropdown
  function handleStationSelect(station) {
    DEFAULTS.STATION_NAME = station.name;
    DEFAULTS.STOP_ID = station.stopId;
    
    // Load saved transport modes if available
    if (station.modes && Array.isArray(station.modes)) {
      DEFAULTS.TRANSPORT_MODES = station.modes;
    }
    
    // Update dropdown title
    board.stationDropdown.updateTitle(station.name, station.modes || DEFAULTS.TRANSPORT_MODES);
    
    // Update options panel if it's open
    if (window.__APP_OPTIONS__ && window.__APP_OPTIONS__.updateFields && document.body.classList.contains('options-open')) {
      window.__APP_OPTIONS__.updateFields();
    }
    
    // Move this station to top of recent list (preserve its stored settings)
    // Use the station's own settings if available, otherwise use current DEFAULTS
    addRecentStation(station.name, station.stopId, station.modes || [], {
      numDepartures: station.numDepartures !== undefined ? station.numDepartures : DEFAULTS.NUM_DEPARTURES,
      fetchInterval: station.fetchInterval !== undefined ? station.fetchInterval : DEFAULTS.FETCH_INTERVAL,
      textSize: station.textSize || DEFAULTS.TEXT_SIZE,
      language: station.language || getLanguage()
    });
    board.stationDropdown.refresh();
    
    // Update document title
    try { document.title = station.name || document.title; } catch(e) {}
    
    // Trigger refresh with new station
    (async () => {
      try {
        await doRefresh({ fallbackToDemo: false });
      } catch(e) { 
        console.warn('Station change refresh failed', e); 
      }
      startRefreshLoop();
    })();
    
    // Save settings
    try {
      localStorage.setItem('departure:settings', JSON.stringify(DEFAULTS));
    } catch(e) {/*ignore*/}
  }

  const board = createBoardElements(DEFAULTS.STATION_NAME, handleStationSelect);
  // Update title with current transport modes (show icons if filtered)
  if (board.stationDropdown) {
    board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
  }
  // track when the next automatic refresh will occur (epoch ms) so we can
  // show a per-second countdown in the header status chip.
  let nextRefreshAt = Date.now();
  // set when a live fetch has actually contacted the API (used for diagnostics)
  let liveFetchSucceeded = false;
  // id for the refresh interval so we can restart it when FETCH_INTERVAL changes
  let refreshTimerId = null;

  // perform a refresh: fetch live data and render results (or empty state)
  async function doRefresh(){
    try{
      if(globalThis._enturCache) globalThis._enturCache.clear();
      // Use stored STOP_ID if available, otherwise lookup by station name
      let stopId = DEFAULTS.STOP_ID;
      if (!stopId) {
        stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
      }
      let fresh = [];
      if(stopId){
        fresh = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
        liveFetchSucceeded = true;
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
  // automatically reloads when a new service worker is installed.
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
        // Check for updates immediately on load (user controls update via reload)
        reg.update();
        
        // helper to show a brief update notification and auto-reload
        const showUpdateNotification = async (worker) => {
          // avoid creating multiple prompts
          if (document.getElementById('sw-update-toast')) return;
          
          // Hide the footer version while showing update
          const footer = document.querySelector('.app-footer');
          if (footer) footer.style.display = 'none';
          
          // Get new version from the waiting service worker
          let newVersion = 'new version';
          try {
            // Fetch the new service worker to extract version
            const swResponse = await fetch('./sw.js');
            const swText = await swResponse.text();
            const versionMatch = swText.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
            if (versionMatch) {
              newVersion = versionMatch[1];
            }
          } catch (e) {
            // If we can't get the version, just use generic text
          }
          
          const toast = document.createElement('div');
          toast.id = 'sw-update-toast';
          
          // Show countdown timer with version upgrade info
          let countdown = 5;
          const updateCountdown = () => {
            toast.innerHTML = `<div>${t('newVersionAvailable')}</div><div>${t('upgradingFrom')} ${VERSION} ${t('to')} ${newVersion}</div><div>${t('updatingIn')} ${countdown}${t('seconds')}</div>`;
          };
          updateCountdown();
          
          document.body.appendChild(toast);
          
          // Update countdown every second
          const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
              updateCountdown();
            } else {
              clearInterval(countdownInterval);
            }
          }, 1000);
          
          // Trigger skipWaiting after 5 seconds
          setTimeout(() => {
            if (worker) {
              worker.postMessage({type: 'SKIP_WAITING'});
            }
          }, 5000);
        };

        // If there's already a waiting worker, notify and reload immediately
        if (reg && reg.waiting) {
          showUpdateNotification(reg.waiting);
        }

        // Listen for updates found (new installing worker)
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              // If there's an active controller, this is an update (not first install)
              if (navigator.serviceWorker.controller) {
                showUpdateNotification(reg.waiting || installing);
              }
            }
          });
        });

        // When the new SW takes control, reload so the user gets the new assets
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          // Force a hard reload by adding a timestamp to bypass any caches
          window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
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
      // If language changed, reload the entire options panel
      if (newOpts._languageChanged) {
        // Close current panel
        opts.close();
        // Remove old panel
        opts.panel.remove();
        // Preserve handlers before recreation
        const savedOnApply = opts._onApply;
        const savedOnSave = opts._onSave;
        // Create new panel with updated translations
        const newOpts = createOptionsPanel(DEFAULTS, savedOnApply, () => updateFooterTranslations(board.footer), savedOnSave);
        document.body.appendChild(newOpts.panel);
        // Update reference
        Object.assign(opts, newOpts);
        // Restore the handlers for future language changes
        opts._onApply = savedOnApply;
        opts._onSave = savedOnSave;
        
        // Update tooltips on global buttons
        updateGlobalButtonTooltips();
        
        // Reopen the panel
        setTimeout(() => opts.open(), 50);
        return;
      }
      
      // apply new defaults and re-init fetch loop by reloading the page state
      // for now just update the UI and re-run first fetch cycle
      DEFAULTS.STATION_NAME = newOpts.STATION_NAME;
      DEFAULTS.STOP_ID = newOpts.STOP_ID || null;
      DEFAULTS.NUM_DEPARTURES = newOpts.NUM_DEPARTURES;
      DEFAULTS.FETCH_INTERVAL = newOpts.FETCH_INTERVAL;
      DEFAULTS.TRANSPORT_MODES = newOpts.TRANSPORT_MODES;
      DEFAULTS.TEXT_SIZE = newOpts.TEXT_SIZE;
      // update station dropdown title
      if (board.stationDropdown) {
        board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
      }
      try{ document.title = DEFAULTS.STATION_NAME || document.title; }catch(e){}
      // trigger a manual refresh
      (async ()=>{
        try{
          await doRefresh();
        }catch(e){ console.warn('Manual refresh failed', e); }
        // restart periodic refresh loop so it uses the updated FETCH_INTERVAL
        startRefreshLoop();
      })();
    // apply text size immediately
    try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
      document.documentElement.classList.add('text-size-'+(newOpts.TEXT_SIZE || 'large'));
    }catch(e){}
  }, () => {
    updateFooterTranslations(board.footer);
    updateGlobalButtonTooltips();
  }, ()=>{
    // onSave callback - only adds to favorites, doesn't apply changes
    if (DEFAULTS.STATION_NAME && DEFAULTS.STOP_ID) {
      addRecentStation(DEFAULTS.STATION_NAME, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, {
        numDepartures: DEFAULTS.NUM_DEPARTURES,
        fetchInterval: DEFAULTS.FETCH_INTERVAL,
        textSize: DEFAULTS.TEXT_SIZE,
        language: getLanguage()
      });
      if (board.stationDropdown) {
        board.stationDropdown.refresh();
      }
    }
  });
  // Store the handlers for future language change reloads
  opts._onApply = (newOpts)=>{
    // apply new defaults and re-init fetch loop by reloading the page state
    // for now just update the UI and re-run first fetch cycle
    DEFAULTS.STATION_NAME = newOpts.STATION_NAME;
    DEFAULTS.STOP_ID = newOpts.STOP_ID || null;
    DEFAULTS.NUM_DEPARTURES = newOpts.NUM_DEPARTURES;
    DEFAULTS.FETCH_INTERVAL = newOpts.FETCH_INTERVAL;
    DEFAULTS.TRANSPORT_MODES = newOpts.TRANSPORT_MODES;
    DEFAULTS.TEXT_SIZE = newOpts.TEXT_SIZE;
    // update station dropdown title
    if (board.stationDropdown) {
      board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
    }
    try{ document.title = DEFAULTS.STATION_NAME || document.title; }catch(e){}
    // trigger a manual refresh
    (async ()=>{
      try{
        await doRefresh();
      }catch(e){ console.warn('Manual refresh failed', e); }
      // restart periodic refresh loop so it uses the updated FETCH_INTERVAL
      startRefreshLoop();
    })();
    // apply text size immediately
    try{ document.documentElement.classList.remove('text-size-tiny','text-size-small','text-size-medium','text-size-large','text-size-xlarge');
      document.documentElement.classList.add('text-size-'+(newOpts.TEXT_SIZE || 'large'));
    }catch(e){}
  };
  opts._onSave = ()=>{
    // onSave callback - only adds to favorites
    if (DEFAULTS.STATION_NAME && DEFAULTS.STOP_ID) {
      addRecentStation(DEFAULTS.STATION_NAME, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, {
        numDepartures: DEFAULTS.NUM_DEPARTURES,
        fetchInterval: DEFAULTS.FETCH_INTERVAL,
        textSize: DEFAULTS.TEXT_SIZE,
        language: getLanguage()
      });
      if (board.stationDropdown) {
        board.stationDropdown.refresh();
      }
    }
  };
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
  // add a global fixed header controls in top-right for easy access
  const gWrap = document.createElement('div'); gWrap.className='global-gear';
  
  // share button (left of theme toggle)
  const shareComponents = createShareButton(() => {
    // Return current settings for sharing
    if (!DEFAULTS.STATION_NAME || !DEFAULTS.STOP_ID) {
      return null; // No station to share
    }
    return {
      STATION_NAME: DEFAULTS.STATION_NAME,
      STOP_ID: DEFAULTS.STOP_ID,
      TRANSPORT_MODES: DEFAULTS.TRANSPORT_MODES,
      NUM_DEPARTURES: DEFAULTS.NUM_DEPARTURES,
      FETCH_INTERVAL: DEFAULTS.FETCH_INTERVAL,
      TEXT_SIZE: DEFAULTS.TEXT_SIZE,
      language: getLanguage()
    };
  });
  gWrap.appendChild(shareComponents.button);
  
  // theme toggle button
  const themeBtn = createThemeToggle();
  gWrap.appendChild(themeBtn);
  
  // settings gear button
  const gBtn = document.createElement('button'); gBtn.className='gear-btn'; gBtn.type='button'; gBtn.textContent=UI_EMOJIS.settings; gBtn.title=t('settingsTooltip');
  gBtn.addEventListener('click', ()=> {
    if (opts && typeof opts.open === 'function' && typeof opts.close === 'function'){
      // toggle based on presence of body class
      if (document.body.classList.contains('options-open')) opts.close(); else opts.open();
    } else if (opts && typeof opts.open === 'function') opts.open();
  });
  gWrap.appendChild(gBtn);
  
  // Store references to buttons for tooltip updates on language change
  window.__GLOBAL_BUTTONS__ = {
    share: shareComponents.button,
    theme: themeBtn,
    settings: gBtn
  };
  
  document.body.appendChild(gWrap);
  
  // Add share URL box to body (for fallback display)
  document.body.appendChild(shareComponents.urlBox);
  
  ROOT.appendChild(board.el);
  
  // Try live data on initial load
  let data = [];
  try{
    // Use stored STOP_ID if available, otherwise lookup by station name
    let stopId = DEFAULTS.STOP_ID;
    if (!stopId) {
      stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
    }
    if(stopId && DEFAULTS.API_URL){
      // use the helper to perform the first refresh
      await doRefresh();
      // ensure the status chip is visible; its textContent will be driven by the
      // per-second ticker below to show "Next update in XX seconds."
      if (board.status) {
        board.status.classList.add('visible');
        // give an initial label while the ticker updates on the next tick
        board.status.textContent = t('live');
      }
    }
  }catch(e){
    console.warn('Live fetch failed', e && e.message ? e.message : e);
    if(board.status){ board.status.classList.add('visible'); board.status.textContent = t('error'); }
  }
  if(!data || !data.length){
    // Show empty state if no data
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
      board.status.textContent = `${t('updatingIn')} ${secLeft}${t('seconds')}`;
    }
  }
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
}

document.addEventListener('DOMContentLoaded', init);
