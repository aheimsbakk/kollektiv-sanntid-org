/**
 * station-autocomplete.js — station name input with debounced search
 *
 * Owns the input element, the 250 ms debounced Entur search with supersede
 * cancellation, blur auto-select, and the dataset-based stopId/lat/lon
 * tracking. Candidate list rendering and highlight state live in
 * autocomplete-list.js.
 */
import { searchStations } from '../../entur/index.js';
import { createCandidateList } from './autocomplete-list.js';

/**
 * Build the station name row with autocomplete behaviour.
 *
 * @param {object}   defaults
 * @param {object}   deps
 * @param {Function} deps.onSelect  — called with no args after a station is confirmed
 * @param {Function} deps.t         — i18n translate fn
 * @returns {{
 *   rowStation: HTMLElement,
 *   acWrap: HTMLElement,
 *   inpStation: HTMLInputElement,
 *   getValue: () => string,
 *   getStopId: () => string,
 *   reset: () => void,
 *   updateField: (name: string, stopId: string) => void,
 * }}
 */
export function createStationAutocomplete(defaults, { onSelect, t }) {
  // Row scaffold
  const rowStation = document.createElement('div');
  rowStation.className = 'options-row';
  const lblStation = document.createElement('label');
  lblStation.textContent = t('stationName');

  const inpStation = document.createElement('input');
  inpStation.type = 'text';
  inpStation.autocomplete = 'off';
  inpStation.setAttribute('aria-autocomplete', 'list');
  inpStation.value = defaults.STATION_NAME || '';

  // Autocomplete wrapper — the floating list is appended on demand
  const acWrap = document.createElement('div');
  acWrap.className = 'station-autocomplete-wrap';
  rowStation.append(lblStation, acWrap);
  acWrap.appendChild(inpStation);

  // Internal state
  let acTimer = null;
  let blurTimer = null;
  let lastQuery = '';
  let updatingField = false;
  let _destroyed = false;
  /**
   * True only when the user has explicitly picked a candidate from the autocomplete
   * list in this panel session. Reset to false by updateField() (panel open / refresh).
   * Used by applyChanges() to decide whether to trust getLat()/getLon() or fall back
   * to the existing DEFAULTS.LAT/LON.
   */
  let _explicitSelection = false;
  /** AbortController for the current in-flight station search fetch */
  let _searchAbortCtrl = null;

  const candidateList = createCandidateList({
    acWrap,
    ariaInput: inpStation,
    onSelectIndex: selectCandidateIndex,
  });

  function selectCandidateIndex(idx) {
    const cands = candidateList.candidates();
    if (idx == null || idx < 0 || idx >= cands.length) return;
    const c = cands[idx];
    if (!c) return;
    inpStation.value = c.name || c.title || c.id || '';
    inpStation.dataset.stopId = String(c.id || '');
    inpStation.dataset.lat = typeof c.lat === 'number' ? String(c.lat) : '';
    inpStation.dataset.lon = typeof c.lon === 'number' ? String(c.lon) : '';
    _explicitSelection = true;
    candidateList.clear();
    onSelect();
  }

  // Input event — debounced search
  inpStation.addEventListener('input', () => {
    if (updatingField) return;
    const v = String(inpStation.value || '');

    if (v === lastQuery) return;
    lastQuery = v;
    inpStation.dataset.stopId = '';
    inpStation.dataset.lat = '';
    inpStation.dataset.lon = '';
    clearTimeout(acTimer);
    if (v.trim().length < 3) {
      candidateList.clear();
      return;
    }

    candidateList.clear(); // clear stale results immediately

    acTimer = setTimeout(async () => {
      const searchQuery = v;
      // Cancel any previous in-flight request before starting a new one
      if (_searchAbortCtrl) _searchAbortCtrl.abort();
      _searchAbortCtrl = new AbortController();
      const { signal } = _searchAbortCtrl;
      try {
        const cands = await searchStations({
          text: searchQuery,
          limit: 5,
          fetchFn: window.fetch,
          signal,
        });
        // Guard: panel may have been destroyed while the fetch was in-flight
        if (_destroyed) return;
        if (inpStation.value === searchQuery) candidateList.show(cands);
      } catch (err) {
        if (err?.name === 'AbortError') return; // cancelled by a newer search — normal
        if (_destroyed) return;
        candidateList.clear();
      }
    }, 250);
  });

  // Keyboard navigation
  inpStation.addEventListener('keydown', (e) => {
    if (candidateList.isOpen()) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        candidateList.moveHighlight(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        candidateList.moveHighlight(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const indexToSelect = candidateList.highlighted() >= 0 ? candidateList.highlighted() : 0;
        if (candidateList.items().length > 0) selectCandidateIndex(indexToSelect);
        // caller handles focus progression
      } else if (e.key === 'Escape') {
        candidateList.clear();
      }
    }
    // Enter with no autocomplete: caller handles focus progression via keydown on inpStation
  });

  // Focus: pre-fill + select text
  inpStation.addEventListener('focus', () => {
    lastQuery = '';
    candidateList.clear();
    if (defaults.STATION_NAME && !inpStation.value) {
      inpStation.value = defaults.STATION_NAME;
      inpStation.dataset.stopId = defaults.STOP_ID || '';
    }
    inpStation.select();
  });

  // Blur: auto-select first candidate if user was typing.
  // The timeout is stored so it can be cancelled on destroy() or if the panel
  // closes before the 150 ms window elapses (prevents spurious onSelect calls).
  inpStation.addEventListener('blur', () => {
    clearTimeout(blurTimer);
    blurTimer = setTimeout(() => {
      if (_destroyed) return;
      if (
        candidateList.isOpen() &&
        candidateList.candidates().length > 0 &&
        !inpStation.dataset.stopId
      ) {
        selectCandidateIndex(0);
      }
      candidateList.clear();
    }, 150);
  });

  // Public API
  function getValue() {
    return inpStation.value;
  }
  function getStopId() {
    return inpStation.dataset.stopId || '';
  }
  function getLat() {
    const v = parseFloat(inpStation.dataset.lat);
    return Number.isFinite(v) ? v : null;
  }
  function getLon() {
    const v = parseFloat(inpStation.dataset.lon);
    return Number.isFinite(v) ? v : null;
  }
  /**
   * Returns true only when the user explicitly selected a station from the
   * autocomplete candidate list during this panel session.
   * False after updateField() (panel open/refresh) or on a fresh mount.
   */
  function wasStationSelected() {
    return _explicitSelection;
  }
  /** Returns true when the autocomplete dropdown is currently visible. */
  function isOpen() {
    return candidateList.isOpen();
  }

  function reset() {
    lastQuery = '';
    candidateList.clear();
  }

  function updateField(name, stopId) {
    updatingField = true;
    inpStation.value = name || '';
    inpStation.dataset.stopId = stopId || '';
    inpStation.dataset.lat = '';
    inpStation.dataset.lon = '';
    _explicitSelection = false;
    lastQuery = '';
    candidateList.clear();
    updatingField = false;
  }

  /** Cancel all pending timers and prevent any further async callbacks. */
  function destroy() {
    _destroyed = true;
    clearTimeout(acTimer);
    clearTimeout(blurTimer);
    if (_searchAbortCtrl) {
      _searchAbortCtrl.abort();
      _searchAbortCtrl = null;
    }
    candidateList.clear();
  }

  return {
    rowStation,
    acWrap,
    inpStation,
    getValue,
    getStopId,
    getLat,
    getLon,
    wasStationSelected,
    isOpen,
    reset,
    updateField,
    destroy,
  };
}
