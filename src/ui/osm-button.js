/**
 * osm-button.js — OpenStreetMap map button
 *
 * Responsibilities:
 *   - Render a single .header-btn button with the 🗺️ emoji
 *   - On click: build an OSM Transport Layer URL from the current station
 *     coordinates and navigate to it in the same tab
 *   - When no coordinates are available, show a transient status message
 *     below the button using the same style as the GPS dropdown status text
 *   - Expose updateTooltip() so language changes are applied without re-mounting
 *
 * URL format (per docs/openstreetmap/howto.md):
 *   https://www.openstreetmap.org/?mlat={lat}&mlon={lon}&zoom=16&layers=T
 */

import { UI_EMOJIS } from '../config.js';
import { t } from '../i18n.js';

/** Zoom level chosen for ~500 m radius view (see docs/openstreetmap/howto.md). */
const OSM_ZOOM = 16;

/** OSM base URL */
const OSM_BASE = 'https://www.openstreetmap.org/';

/**
 * Build an OpenStreetMap Transport Layer URL for a given coordinate.
 *
 * @param {number} lat - WGS 84 latitude
 * @param {number} lon - WGS 84 longitude
 * @returns {string} Full OSM URL with pin marker and Transport layer
 */
export function buildOsmUrl(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new TypeError('lat and lon must be numbers');
  }
  // Round to 6 decimal places (~11 cm precision) — sufficient for transit stops
  const latStr = lat.toFixed(6);
  const lonStr = lon.toFixed(6);
  return `${OSM_BASE}?mlat=${latStr}&mlon=${lonStr}&zoom=${OSM_ZOOM}&layers=T`;
}

/**
 * Create the OSM map button element.
 *
 * @param {Function} getCoords - Returns { lat: number|null, lon: number|null }
 *   for the currently active station. Called on every click so it always
 *   reflects the live state without closures capturing stale values.
 * @returns {HTMLButtonElement} Button element; exposes .updateTooltip()
 */
export function createOsmButton(getCoords) {
  const btn = document.createElement('button');
  btn.className = 'header-btn osm-btn';
  btn.type = 'button';
  btn.tabIndex = 1; // Shares the left-bar tab order with the compass button
  btn.textContent = UI_EMOJIS.map;
  btn.title = t('osmTooltip');
  btn.setAttribute('aria-label', t('osmTooltip'));

  // Status message shown below the button when no coords are available —
  // mirrors .gps-dropdown-status / .gps-dropdown-error from gps-dropdown.js
  const status = document.createElement('div');
  status.className = 'gps-dropdown-status gps-dropdown-error osm-status';
  status.setAttribute('aria-live', 'polite');

  let _statusTimer = null;

  function showStatus(msg) {
    status.textContent = msg;
    status.classList.add('visible');
    clearTimeout(_statusTimer);
    _statusTimer = setTimeout(() => {
      status.classList.remove('visible');
    }, 3000);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const coords = getCoords();
    if (coords == null || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
      showStatus(t('osmNoCoords'));
      return;
    }

    window.location.href = buildOsmUrl(coords.lat, coords.lon);
  });

  /** Re-read translation after a language change (called by onLanguageChange). */
  btn.updateTooltip = function () {
    btn.title = t('osmTooltip');
    btn.setAttribute('aria-label', t('osmTooltip'));
  };

  // Attach status to the button so callers can access it as btn.statusEl
  btn.statusEl = status;

  return btn;
}
  // Round to 6 decimal places (~11 cm precision) — sufficient for transit stops
  const latStr = lat.toFixed(6);
  const lonStr = lon.toFixed(6);
  return `${OSM_BASE}?mlat=${latStr}&mlon=${lonStr}&zoom=${OSM_ZOOM}&layers=T`;
}

/**
 * Show a transient toast on document.body with the given message.
 * Reuses a single #osm-toast element; auto-dismisses after 3 s.
 *
 * @param {string} msg
 */
let _osmToastTimer = null;
function showOsmToast(msg) {
  let toast = document.getElementById('osm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'osm-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(_osmToastTimer);
  _osmToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Create the OSM map button element.
 *
 * @param {Function} getCoords - Returns { lat: number|null, lon: number|null }
 *   for the currently active station. Called on every click so it always
 *   reflects the live state without closures capturing stale values.
 * @returns {HTMLButtonElement} Button element; exposes .updateTooltip()
 */
export function createOsmButton(getCoords) {
  const btn = document.createElement('button');
  btn.className = 'header-btn osm-btn';
  btn.type = 'button';
  btn.tabIndex = 1; // Shares the left-bar tab order with the compass button
  btn.textContent = UI_EMOJIS.map;
  btn.title = t('osmTooltip');
  btn.setAttribute('aria-label', t('osmTooltip'));

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const coords = getCoords();
    if (coords == null || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
      showOsmToast(t('osmNoCoords'));
      return;
    }

    const url = buildOsmUrl(coords.lat, coords.lon);
    window.location.href = url;
  });

  /** Re-read translation after a language change (called by onLanguageChange). */
  btn.updateTooltip = function () {
    btn.title = t('osmTooltip');
    btn.setAttribute('aria-label', t('osmTooltip'));
  };

  return btn;
}
