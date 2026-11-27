/**
 * favorites-store.js — favorites (recent stations) persistence
 *
 * Owns the `recent-stations` localStorage key and the favorites CRUD rules:
 * an entry is unique per (stopId + modes) pair, the list is ordered by
 * recency, and it is truncated to DEFAULTS.NUM_FAVORITES.
 * DOM-free by design — presentation lives in station-dropdown.js.
 */

import { DEFAULTS, DEFAULT_FAVORITE } from '../config.js';
import { decodeSettings } from './share-button.js';

const STORAGE_KEY = 'recent-stations';

/**
 * Compare two mode arrays for equality (order doesn't matter)
 * @param {Array<string>} modes1
 * @param {Array<string>} modes2
 * @returns {boolean}
 */
export function modesEqual(modes1, modes2) {
  const m1 = modes1 || [];
  const m2 = modes2 || [];

  if (m1.length !== m2.length) return false;

  // Sort both arrays and compare
  const sorted1 = m1.slice().sort();
  const sorted2 = m2.slice().sort();

  return sorted1.every((mode, i) => mode === sorted2[i]);
}

/**
 * Get recent stations from localStorage.
 * Returns an empty array when no favorites have been saved yet.
 * @returns {Array<{name: string, stopId: string, modes?: Array<string>}>}
 */
export function getRecentStations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load recent stations:', e);
    return [];
  }
}

/**
 * Decode DEFAULT_FAVORITE and return it as a station object without touching localStorage.
 * Used as the initial station when the user has no saved favorites.
 * @returns {{ name: string, stopId: string, modes: string[] } | null}
 */
export function getDefaultStation() {
  if (!DEFAULT_FAVORITE) return null;
  try {
    const decoded = decodeSettings(DEFAULT_FAVORITE);
    if (decoded && decoded.stationName && decoded.stopId) {
      return {
        name: decoded.stationName,
        stopId: decoded.stopId,
        modes: decoded.transportModes || [],
        lat: typeof decoded.lat === 'number' ? decoded.lat : undefined,
        lon: typeof decoded.lon === 'number' ? decoded.lon : undefined,
      };
    }
  } catch (e) {
    console.warn('Failed to decode DEFAULT_FAVORITE', e);
  }
  return null;
}

/**
 * Add or update a recent station with full settings
 * @param {string} name - Station name
 * @param {string} stopId - Station stop ID
 * @param {Array<string>} modes - Transport modes (e.g., ['bus', 'tram'])
 * @param {Object} settings - Optional full settings object { numDepartures, fetchInterval, textSize, language, lat, lon }
 */
export function addRecentStation(name, stopId, modes = [], settings = {}) {
  if (!name || !stopId) return;

  let recent = getRecentStations();

  // Remove exact duplicate (same stopId AND same modes)
  recent = recent.filter((s) => !(s.stopId === stopId && modesEqual(s.modes, modes)));

  // Add to top with full settings
  recent.unshift({
    name,
    stopId,
    modes: modes || [],
    // Store all settings for future use (but don't apply them on restore yet)
    numDepartures: settings.numDepartures,
    fetchInterval: settings.fetchInterval,
    textSize: settings.textSize,
    language: settings.language,
    /** GPS latitude (WGS 84) of the stop, or undefined when unknown */
    lat: typeof settings.lat === 'number' ? settings.lat : undefined,
    /** GPS longitude (WGS 84) of the stop, or undefined when unknown */
    lon: typeof settings.lon === 'number' ? settings.lon : undefined,
  });

  // Keep only NUM_FAVORITES
  if (recent.length > DEFAULTS.NUM_FAVORITES) {
    recent = recent.slice(0, DEFAULTS.NUM_FAVORITES);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to save recent stations:', e);
  }
}

/**
 * Check if a station (by stopId + modes combo) exists in the favorites list.
 * A station with different transport modes is considered a separate favorite.
 * @param {string} stopId - Station stop ID to check
 * @param {Array<string>} [modes] - Transport modes to match
 * @returns {boolean}
 */
export function isStationInFavorites(stopId, modes) {
  if (!stopId) return false;
  const recent = getRecentStations();
  return recent.some((s) => s.stopId === stopId && modesEqual(s.modes, modes));
}

/**
 * Remove a station (by stopId + modes combo) from favorites without changing order of others.
 * @param {string} stopId - Station stop ID to remove
 * @param {Array<string>} [modes] - Transport modes to match
 * @returns {boolean} true if an entry was removed, false if not found
 */
export function removeFromFavorites(stopId, modes) {
  if (!stopId) return false;
  const recent = getRecentStations();
  const before = recent.length;
  const filtered = recent.filter((s) => !(s.stopId === stopId && modesEqual(s.modes, modes)));
  if (filtered.length === before) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save recent stations:', e);
  }
  return true;
}
