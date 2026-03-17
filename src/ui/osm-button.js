/**
 * osm-button.js — OpenStreetMap map button
 *
 * Responsibilities:
 *   - Render a single .header-btn button with the 🗺️ emoji
 *   - On click: build an OSM Transport Layer URL from the current station
 *     coordinates and open it in a new tab
 *   - When no coordinates are available, log a warning and do nothing visible
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

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const coords = getCoords();
    if (coords == null || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
      console.warn('[osm-button] No coordinates available for the current station');
      return;
    }

    const url = buildOsmUrl(coords.lat, coords.lon);
    // Open in a new tab; rel="noopener noreferrer" prevents tabnapping
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    // Fallback: if popup was blocked, navigate the current tab
    if (!win) {
      window.location.href = url;
    }
  });

  /** Re-read translation after a language change (called by onLanguageChange). */
  btn.updateTooltip = function () {
    btn.title = t('osmTooltip');
    btn.setAttribute('aria-label', t('osmTooltip'));
  };

  return btn;
}
