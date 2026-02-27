/**
 * app.js — Application entry point
 *
 * Bootstraps the departure board:
 *   1. Loads persisted settings from localStorage.
 *   2. Decodes a shared-board URL parameter (?b= / ?board=) if present.
 *   3. Builds the DOM via the UI modules.
 *   4. Starts the live-data fetch loop and per-second countdown ticker.
 *   5. Registers the service worker and handles the auto-update flow.
 *
 * All state is local to the init() function; nothing is intentionally
 * exposed on the global window object.
 */

import { DEFAULTS, VERSION, UI_EMOJIS } from './config.js';
import { formatCountdown } from './time.js';
import { createBoardElements, clearList, updateFooterTranslations, updateFavoriteButton } from './ui/ui.js';
import { createHeaderToggle } from './ui/header.js';
import { createOptionsPanel } from './ui/options.js';
import { createDepartureNode, updateDepartureCountdown } from './ui/departure.js';
import { fetchDepartures, lookupStopId } from './entur.js';
import { initLanguage, t, getLanguage } from './i18n.js';
import { addRecentStation } from './ui/station-dropdown.js';
import { initTheme, createThemeToggle, getTheme } from './ui/theme-toggle.js';
import { createShareButton, decodeSettings } from './ui/share-button.js';

// Initialise language and theme before any DOM is built so that the correct
// strings and colours are in place from the very first render.
initLanguage();
initTheme();

// Root element that holds the board (defined in index.html)
const ROOT = document.getElementById('app');

// ---------------------------------------------------------------------------
// Departure list rendering
// ---------------------------------------------------------------------------

/**
 * Re-render the departure list from scratch.
 * Shows an empty-state message when the array is empty.
 *
 * @param {HTMLElement} listEl - Container element for departure rows
 * @param {Array<Object>} items - Parsed departure objects
 */
function renderDepartures(listEl, items) {
  clearList(listEl);
  if (!items || items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('noDepartures');
    listEl.appendChild(empty);
    return;
  }
  for (const item of items) {
    const node = createDepartureNode(item);
    // Render the initial countdown so there is no blank moment before the
    // first tick of the setInterval below.
    updateDepartureCountdown(node, Date.now(), formatCountdown, t);
    listEl.appendChild(node.container);
  }
}

// ---------------------------------------------------------------------------
// Text-size helper
// ---------------------------------------------------------------------------

/** All supported text-size CSS class names */
const TEXT_SIZE_CLASSES = ['text-size-tiny', 'text-size-small', 'text-size-medium', 'text-size-large', 'text-size-xlarge'];

/**
 * Apply the given text-size class to <html>, removing any previous one.
 * @param {string} size - One of: tiny | small | medium | large | xlarge
 */
function applyTextSize(size) {
  try {
    document.documentElement.classList.remove(...TEXT_SIZE_CLASSES);
    document.documentElement.classList.add(`text-size-${size || 'medium'}`);
  } catch (_) { /* non-critical */ }
}

// ---------------------------------------------------------------------------
// Main init
// ---------------------------------------------------------------------------

async function init() {
  // ------------------------------------------------------------------
  // 1. Load persisted settings
  // ------------------------------------------------------------------
  try {
    const saved = localStorage.getItem('departure:settings');
    if (saved) {
      // Merge saved values into DEFAULTS, preserving any keys not present in
      // the saved snapshot (forward-compatibility with new settings fields).
      Object.assign(DEFAULTS, JSON.parse(saved));
    }
  } catch (_) { /* ignore corrupt storage */ }

  // ------------------------------------------------------------------
  // 2. Decode shared-board URL parameter (?b= or legacy ?board=)
  // ------------------------------------------------------------------
  try {
    const urlParams  = new URLSearchParams(window.location.search);

    // Remove the service-worker cache-busting timestamp added on auto-reload
    if (urlParams.has('t')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const boardParam = urlParams.get('b') || urlParams.get('board');
    if (boardParam) {
      const shared = decodeSettings(boardParam);
      if (shared) {
        // Apply all decoded fields to DEFAULTS
        DEFAULTS.STATION_NAME      = shared.stationName;
        DEFAULTS.STOP_ID           = shared.stopId;
        DEFAULTS.TRANSPORT_MODES   = shared.transportModes;
        DEFAULTS.NUM_DEPARTURES    = shared.numDepartures;
        DEFAULTS.FETCH_INTERVAL    = shared.fetchInterval;
        DEFAULTS.TEXT_SIZE         = shared.textSize;

        // Persist the imported language so it survives a reload
        if (shared.language) {
          try {
            localStorage.setItem('departure:language', shared.language);
            initLanguage();
          } catch (_) { /* ignore */ }
        }

        // Add to favorites so the shared station appears in the dropdown
        if (shared.stationName && shared.stopId) {
          addRecentStation(shared.stationName, shared.stopId, shared.transportModes || [], {
            numDepartures: shared.numDepartures,
            fetchInterval: shared.fetchInterval,
            textSize:      shared.textSize,
            language:      shared.language
          });
        }

        // Persist to localStorage so settings survive after URL is cleaned
        try {
          localStorage.setItem('departure:settings', JSON.stringify(DEFAULTS));
        } catch (_) { /* ignore */ }

        // Clean the URL to prevent accidental re-import on hard reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  } catch (err) {
    console.warn('Failed to decode shared board URL', err);
  }

  // ------------------------------------------------------------------
  // 3. Build DOM
  // ------------------------------------------------------------------

  /**
   * Called when the user selects a station from the favorites dropdown.
   * Updates DEFAULTS, persists the choice, and triggers an immediate refresh.
   * @param {Object} station - { name, stopId, modes, numDepartures?, fetchInterval?, textSize?, language? }
   */
  function handleStationSelect(station) {
    DEFAULTS.STATION_NAME = station.name;
    DEFAULTS.STOP_ID      = station.stopId;
    if (Array.isArray(station.modes)) {
      DEFAULTS.TRANSPORT_MODES = station.modes;
    }

    // Sync the dropdown title and, if the options panel is open, its fields
    board.stationDropdown.updateTitle(station.name, station.modes || DEFAULTS.TRANSPORT_MODES);
    if (document.body.classList.contains('options-open') && opts?.updateFields) {
      opts.updateFields();
    }

    // Move to top of favorites list, preserving the station's own settings
    addRecentStation(station.name, station.stopId, station.modes || [], {
      numDepartures: station.numDepartures ?? DEFAULTS.NUM_DEPARTURES,
      fetchInterval: station.fetchInterval ?? DEFAULTS.FETCH_INTERVAL,
      textSize:      station.textSize      ?? DEFAULTS.TEXT_SIZE,
      language:      station.language      ?? getLanguage()
    });
    board.stationDropdown.refresh();

    // Update the browser tab title
    try { document.title = station.name || document.title; } catch (_) {}

    // Kick off a refresh with the new station then restart the interval
    doRefresh().catch(err => console.warn('Station change refresh failed', err))
      .finally(() => startRefreshLoop());

    // Persist updated settings
    try {
      localStorage.setItem('departure:settings', JSON.stringify(DEFAULTS));
    } catch (_) { /* ignore */ }

    // Update heart button state
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());
  }

  /**
   * Called when the user clicks the heart button to save to favorites.
   * Adds the current station to favorites and updates the heart button state.
   */
  function handleFavoriteToggle() {
    if (DEFAULTS.STATION_NAME && DEFAULTS.STOP_ID) {
      addRecentStation(DEFAULTS.STATION_NAME, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, {
        numDepartures: DEFAULTS.NUM_DEPARTURES,
        fetchInterval: DEFAULTS.FETCH_INTERVAL,
        textSize:      DEFAULTS.TEXT_SIZE,
        language:      getLanguage()
      });
      if (board.stationDropdown) board.stationDropdown.refresh();
      updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());
    }
  }

  const board = createBoardElements(DEFAULTS.STATION_NAME, handleStationSelect, handleFavoriteToggle);

  // Sync dropdown title so mode icons show up when a filter is active
  if (board.stationDropdown) {
    board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
  }

  // Set initial heart button state
  updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());

  // ------------------------------------------------------------------
  // 4. Fetch loop state
  // ------------------------------------------------------------------

  /** Epoch-ms timestamp of the next scheduled automatic refresh */
  let nextRefreshAt = Date.now();

  /** setInterval handle for the periodic refresh loop */
  let refreshTimerId = null;

  /** The most recently fetched departure data (kept for re-render on settings change) */
  let data = [];

  /**
   * Fetch live departures and re-render the list.
   * On failure the error is logged and any previous data is left in place.
   */
  async function doRefresh() {
    try {
      // Use the stored stop-ID when available; otherwise resolve by name
      let stopId = DEFAULTS.STOP_ID;
      if (!stopId) {
        stopId = await lookupStopId({
          stationName: DEFAULTS.STATION_NAME,
          clientName:  DEFAULTS.CLIENT_NAME
        });
      }

      const fresh = stopId
        ? await fetchDepartures({
            stopId,
            numDepartures: DEFAULTS.NUM_DEPARTURES,
            modes:         DEFAULTS.TRANSPORT_MODES,
            apiUrl:        DEFAULTS.API_URL,
            clientName:    DEFAULTS.CLIENT_NAME
          })
        : [];

      renderDepartures(board.list, fresh);
      data = fresh;
    } catch (err) {
      console.warn('Refresh failed', err);
    } finally {
      // Schedule the next automatic refresh from NOW so FETCH_INTERVAL changes
      // take effect immediately after a manual settings apply.
      nextRefreshAt = Date.now() + DEFAULTS.FETCH_INTERVAL * 1000;
    }
  }

  /**
   * (Re)start the automatic refresh interval.
   * Safe to call multiple times — clears any existing interval first.
   */
  function startRefreshLoop() {
    if (refreshTimerId) clearInterval(refreshTimerId);
    nextRefreshAt  = Date.now() + DEFAULTS.FETCH_INTERVAL * 1000;
    refreshTimerId = setInterval(
      () => doRefresh().catch(err => console.warn('Refresh failed', err)),
      DEFAULTS.FETCH_INTERVAL * 1000
    );
  }

  // ------------------------------------------------------------------
  // 5. Settings / options panel
  // ------------------------------------------------------------------

  /**
   * Callback invoked by the options panel when the user applies new settings.
   * Updates DEFAULTS, re-applies text size, and triggers an immediate refresh.
   * @param {Object} newOpts - New settings values (mirrors DEFAULTS shape)
   */
  function onApplySettings(newOpts) {
    DEFAULTS.STATION_NAME    = newOpts.STATION_NAME;
    DEFAULTS.STOP_ID         = newOpts.STOP_ID || null;
    DEFAULTS.NUM_DEPARTURES  = newOpts.NUM_DEPARTURES;
    DEFAULTS.FETCH_INTERVAL  = newOpts.FETCH_INTERVAL;
    DEFAULTS.TRANSPORT_MODES = newOpts.TRANSPORT_MODES;
    DEFAULTS.TEXT_SIZE       = newOpts.TEXT_SIZE;

    // Sync the dropdown title
    if (board.stationDropdown) {
      board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
    }
    try { document.title = DEFAULTS.STATION_NAME || document.title; } catch (_) {}

    applyTextSize(newOpts.TEXT_SIZE);

    // Update heart button state
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());

    // Fetch with new settings then restart the loop so the new interval is used
    doRefresh()
      .catch(err => console.warn('Manual refresh failed', err))
      .finally(() => startRefreshLoop());
  }

  /**
   * Callback invoked by the options panel when the language changes.
   * Re-renders the footer text and button tooltips with new translations.
   */
  function onLanguageChange() {
    updateFooterTranslations(board.footer);
    updateButtonTooltips();
  }

  // Build options panel and append to body (hidden until opened)
  const opts = createOptionsPanel(DEFAULTS, onApplySettings, onLanguageChange);
  document.body.appendChild(opts.panel);

  // ------------------------------------------------------------------
  // 6. Global action bar (share, theme, settings)
  // ------------------------------------------------------------------

  // Share button — encodes current board config as a compact base64 URL
  const shareComponents = createShareButton(() => {
    if (!DEFAULTS.STATION_NAME || !DEFAULTS.STOP_ID) return null;
    return {
      STATION_NAME:    DEFAULTS.STATION_NAME,
      STOP_ID:         DEFAULTS.STOP_ID,
      TRANSPORT_MODES: DEFAULTS.TRANSPORT_MODES,
      NUM_DEPARTURES:  DEFAULTS.NUM_DEPARTURES,
      FETCH_INTERVAL:  DEFAULTS.FETCH_INTERVAL,
      TEXT_SIZE:       DEFAULTS.TEXT_SIZE,
      language:        getLanguage()
    };
  });

  // Theme toggle button (light / auto / dark cycle)
  const themeBtn = createThemeToggle(() => {
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());
  });

  // Settings gear button (opens / closes the options panel)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'gear-btn';
  settingsBtn.type      = 'button';
  settingsBtn.textContent = UI_EMOJIS.settings;
  settingsBtn.title       = t('settingsTooltip');
  settingsBtn.addEventListener('click', () => {
    if (document.body.classList.contains('options-open')) {
      opts.close();
    } else {
      opts.open();
    }
  });

  // Bundle the three buttons into a fixed top-right container
  const globalBar = document.createElement('div');
  globalBar.className = 'global-gear';
  globalBar.appendChild(shareComponents.button);
  globalBar.appendChild(themeBtn);
  globalBar.appendChild(settingsBtn);
  document.body.appendChild(globalBar);

  // Fallback URL-display box (shown when clipboard write is unavailable)
  document.body.appendChild(shareComponents.urlBox);

  // Helper used by onLanguageChange to keep button tooltips in sync
  function updateButtonTooltips() {
    shareComponents.button.title = t('shareBoard');
    shareComponents.button.setAttribute('aria-label', t('shareBoard'));
    themeBtn.title    = t('themeTooltip');
    settingsBtn.title = t('settingsTooltip');
    // Refresh favorite button (tooltip + state)
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());
  }

  // ------------------------------------------------------------------
  // 7. Header gear icon (opens options from the station header)
  // ------------------------------------------------------------------
  const headerControls = createHeaderToggle(() => opts.open());
  const headerWrap = board.el.headerWrap || board.el.querySelector('.header-wrap') || board.el;
  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';
  headerRight.appendChild(headerControls.el);
  headerWrap.appendChild(headerRight);

  // ------------------------------------------------------------------
  // 8. Mount board and apply initial text size
  // ------------------------------------------------------------------
  ROOT.appendChild(board.el);
  applyTextSize(DEFAULTS.TEXT_SIZE || 'medium');

  try { document.title = DEFAULTS.STATION_NAME || document.title; } catch (_) {}

  // ------------------------------------------------------------------
  // 9. Service worker registration & auto-update flow
  // ------------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      // Check for a newer SW immediately on load
      reg.update().catch(() => {});

      /**
       * Show a 5-second countdown toast, then trigger skipWaiting so the new
       * service worker activates and the page reloads with fresh assets.
       * @param {ServiceWorker} worker - The waiting or installing worker
       */
      const showUpdateNotification = async (worker) => {
        // Avoid stacking multiple toasts
        if (document.getElementById('sw-update-toast')) return;

        // Temporarily hide the footer version during the update countdown
        const footer = document.querySelector('.app-footer');
        if (footer) footer.style.display = 'none';

        // Try to read the new version string from the incoming SW script
        let newVersion = 'new version';
        try {
          const swText = await fetch('./sw.js').then(r => r.text());
          const match  = swText.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
          if (match) newVersion = match[1];
        } catch (_) { /* use fallback string */ }

        const toast = document.createElement('div');
        toast.id = 'sw-update-toast';

        let countdown = 5;
        const updateToast = () => {
          toast.innerHTML =
            `<div>${t('newVersionAvailable')}</div>` +
            `<div>${t('upgradingFrom')} ${VERSION} ${t('to')} ${newVersion}</div>` +
            `<div>${t('updatingIn')} ${countdown}${t('seconds')}</div>`;
        };
        updateToast();
        document.body.appendChild(toast);

        const countdownId = setInterval(() => {
          countdown--;
          if (countdown > 0) updateToast();
          else clearInterval(countdownId);
        }, 1000);

        // Tell the waiting worker to activate after 5 s
        setTimeout(() => {
          if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
        }, 5000);
      };

      // If there is already a waiting worker (e.g. page was open in background)
      if (reg.waiting) showUpdateNotification(reg.waiting);

      // Watch for a newly installed worker becoming ready
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification(reg.waiting || installing);
          }
        });
      });

      // When the new SW takes control, perform a hard reload to use fresh assets
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        // Append a timestamp to bust any remaining in-memory caches
        window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
      });
    } catch (_) { /* SW registration failure is non-fatal */ }
  }

  // ------------------------------------------------------------------
  // 10. Initial data load
  // ------------------------------------------------------------------
  if (board.status) board.status.classList.add('visible');

  try {
    let stopId = DEFAULTS.STOP_ID;
    if (!stopId && DEFAULTS.STATION_NAME) {
      stopId = await lookupStopId({
        stationName: DEFAULTS.STATION_NAME,
        clientName:  DEFAULTS.CLIENT_NAME
      });
    }
    if (stopId && DEFAULTS.API_URL) {
      await doRefresh();
      if (board.status) board.status.textContent = t('live');
    }
  } catch (err) {
    console.warn('Initial fetch failed', err?.message ?? err);
    if (board.status) board.status.textContent = t('error');
  }

  // Ensure an empty state is shown when the initial fetch produced nothing
  if (!data || data.length === 0) renderDepartures(board.list, []);

  // ------------------------------------------------------------------
  // 11. Start loops
  // ------------------------------------------------------------------
  startRefreshLoop();

  /**
   * Per-second ticker: updates all countdown chips and the header status chip.
   * Reads `data-epoch-ms` from each `.departure-time` element so this function
   * is pure DOM-driven and does not depend on any application state.
   */
  function tickCountdowns() {
    const now = Date.now();

    // Update all visible departure countdowns
    board.list.querySelectorAll('.departure-time').forEach(el => {
      const raw   = el.dataset.epochMs;
      const epoch = raw == null || raw === '' ? NaN : Number(raw);
      el.textContent = Number.isFinite(epoch) ? (formatCountdown(epoch, now, t) ?? '—') : '—';
    });

    // Update the header status chip with seconds until next auto-refresh
    if (board.status) {
      const msLeft  = typeof nextRefreshAt === 'number' ? nextRefreshAt - now : DEFAULTS.FETCH_INTERVAL * 1000;
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
      board.status.textContent = `${t('updatingIn')} ${secLeft}${t('seconds')}`;
    }
  }

  // Run once immediately so there is no blank tick delay
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
}

document.addEventListener('DOMContentLoaded', init);
