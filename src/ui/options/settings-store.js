// settings-store.js — options-panel persistence over the shared settings rules.
// Validation bounds live in src/app/settings.js (single owner, RULES §15/§17);
// this module only adapts raw form values to that shape and writes them.
import { ALL_TRANSPORT_MODES } from '../../config.js';
import {
  STORAGE_KEY,
  SETTINGS_BOUNDS,
  VALID_TEXT_SIZES,
  DEFAULT_TEXT_SIZE,
  clampNumber,
} from '../../app/settings.js';

/** Load persisted settings from localStorage. Returns null on failure. */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[settings-store] Failed to read settings from localStorage', err);
    return null;
  }
}

/**
 * Persist a validated options object to localStorage. Failures are logged,
 * never silently swallowed — a broken write must be visible (RULES §11).
 */
export function saveSettings(opts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
  } catch (err) {
    console.warn('[settings-store] Failed to save settings to localStorage', err);
  }
}

/**
 * Validate and normalise raw form values against defaults.
 * Numeric fields are clamped to the shared SETTINGS_BOUNDS so out-of-range
 * form input always persists as a value the bootstrap loader will accept.
 * @param {object} raw   — { STATION_NAME, STOP_ID, LAT, LON, NUM_DEPARTURES, FETCH_INTERVAL, TRANSPORT_MODES, TEXT_SIZE }
 * @param {object} defaults
 * @returns {object} normalised options object
 */
export function validateOptions(raw, defaults) {
  const numDepartures = clampNumber(
    raw.NUM_DEPARTURES,
    SETTINGS_BOUNDS.NUM_DEPARTURES,
    defaults.NUM_DEPARTURES
  );

  const fetchInterval = clampNumber(
    raw.FETCH_INTERVAL,
    SETTINGS_BOUNDS.FETCH_INTERVAL,
    defaults.FETCH_INTERVAL
  );

  const modes = Array.isArray(raw.TRANSPORT_MODES)
    ? raw.TRANSPORT_MODES.filter((m) => ALL_TRANSPORT_MODES.includes(m))
    : [];

  const textSize =
    typeof raw.TEXT_SIZE === 'string' && VALID_TEXT_SIZES.includes(raw.TEXT_SIZE)
      ? raw.TEXT_SIZE
      : defaults.TEXT_SIZE || DEFAULT_TEXT_SIZE;

  return {
    STATION_NAME: raw.STATION_NAME || defaults.STATION_NAME,
    STOP_ID: raw.STOP_ID || null,
    LAT: typeof raw.LAT === 'number' ? raw.LAT : null,
    LON: typeof raw.LON === 'number' ? raw.LON : null,
    NUM_DEPARTURES: numDepartures,
    FETCH_INTERVAL: fetchInterval,
    TRANSPORT_MODES: modes.length ? modes : ALL_TRANSPORT_MODES.slice(),
    TEXT_SIZE: textSize,
  };
}

/**
 * Returns true if any field differs between two options objects.
 * TRANSPORT_MODES compared as sorted JSON.
 */
export function diffOptions(a, b) {
  return (
    a.STATION_NAME !== b.STATION_NAME ||
    a.STOP_ID !== b.STOP_ID ||
    a.NUM_DEPARTURES !== b.NUM_DEPARTURES ||
    a.FETCH_INTERVAL !== b.FETCH_INTERVAL ||
    a.TEXT_SIZE !== b.TEXT_SIZE ||
    JSON.stringify((a.TRANSPORT_MODES || []).slice().sort()) !==
      JSON.stringify((b.TRANSPORT_MODES || []).slice().sort())
  );
}
