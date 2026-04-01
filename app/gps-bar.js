/**
 * gps-bar.js — GPS action bar (top-left: compass button, share button, OSM map button)
 *
 * Creates a fixed top-left bar with the following layout:
 *   🧭  📋
 *   🗺️
 *
 * The compass and OSM buttons are stacked vertically in a column; the share
 * button sits to the right of the compass button on the top row.
 *
 * Mirrors the pattern of action-bar.js (top-right bar) for the left side.
 */

import { createGpsButton } from '../ui/gps-dropdown.js';
import { createOsmButton } from '../ui/osm-button.js';

/**
 * Build and mount the GPS action bar.
 *
 * @param {Function}     onStationSelect - Called with { name, stopId, modes } when a nearby stop is chosen
 * @param {Function}     getCoords       - Returns { lat, lon } for the active station (called on each OSM click)
 * @param {HTMLElement}  shareBtn        - The share button element (from action-bar.js)
 * @returns {{ gpsContainer: HTMLElement, osmBtn: HTMLButtonElement }}
 */
export function buildGpsBar(onStationSelect, getCoords, shareBtn) {
  const gpsContainer = createGpsButton(onStationSelect);
  const osmBtn = createOsmButton(getCoords);

  // Wrap the OSM button in a relative container so the status message can be
  // positioned absolutely below it — mirrors .gps-dropdown-container pattern.
  const osmContainer = document.createElement('div');
  osmContainer.className = 'gps-dropdown-container';
  osmContainer.appendChild(osmBtn);
  osmContainer.appendChild(osmBtn.statusEl);

  // Left column: compass on top, OSM map below
  const leftCol = document.createElement('div');
  leftCol.className = 'gps-bar__col';
  leftCol.appendChild(gpsContainer);
  leftCol.appendChild(osmContainer);

  const gpsBar = document.createElement('div');
  gpsBar.className = 'gps-bar';
  gpsBar.appendChild(leftCol);
  if (shareBtn) gpsBar.appendChild(shareBtn);
  document.body.appendChild(gpsBar);

  return { gpsContainer, osmBtn };
}
