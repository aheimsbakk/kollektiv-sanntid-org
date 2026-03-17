/**
 * gps-bar.js — GPS action bar (top-left: compass button + OSM map button)
 *
 * Creates a fixed top-left bar containing:
 *   1. GPS nearby-stops button (🧭 compass)
 *   2. OpenStreetMap button (🗺️) — opens OSM with a pin at the current station
 *
 * Mirrors the pattern of action-bar.js (top-right bar) for the left side.
 */

import { createGpsButton } from '../ui/gps-dropdown.js';
import { createOsmButton } from '../ui/osm-button.js';

/**
 * Build and mount the GPS action bar.
 *
 * @param {Function} onStationSelect - Called with { name, stopId, modes } when a nearby stop is chosen
 * @param {Function} getCoords       - Returns { lat, lon } for the active station (called on each OSM click)
 * @returns {{ gpsContainer: HTMLElement, osmBtn: HTMLButtonElement }}
 */
export function buildGpsBar(onStationSelect, getCoords) {
  const gpsContainer = createGpsButton(onStationSelect);
  const osmBtn = createOsmButton(getCoords);

  const gpsBar = document.createElement('div');
  gpsBar.className = 'gps-bar';
  gpsBar.appendChild(gpsContainer);
  gpsBar.appendChild(osmBtn);
  document.body.appendChild(gpsBar);

  return { gpsContainer, osmBtn };
}
