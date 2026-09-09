// station-autocomplete.js — debounced station search, keyboard navigation, candidate list DOM
import { searchStations } from '../../entur/index.js';

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
  let acList = null;
  let acTimer = null;
  let blurTimer = null;
  let lastQuery = '';
  let highlighted = -1;
  let lastCandidates = [];
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

  function clearAutocomplete() {
    try {
      if (acList && acList.parentElement) acList.parentElement.removeChild(acList);
    } catch (e) {
      /* ignore */
    }
    acList = null;
    highlighted = -1;
    lastCandidates = [];
  }

  function showCandidates(cands) {
    lastCandidates = Array.isArray(cands) ? cands.slice() : [];
    if (lastCandidates.length === 0) {
      clearAutocomplete();
      return;
    }

    if (!acList) {
      acList = document.createElement('div');
      acList.className = 'station-autocomplete-list';
      acList.id = 'station-autocomplete-list';
      acList.setAttribute('role', 'listbox');
      acWrap.appendChild(acList);
    }
    acList.innerHTML = '';
    lastCandidates.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      // Render bare name at full opacity; locality suffix (e.g. ", Oslo") dimmed
      const name = c.name || c.title || '';
      const suffix =
        c.name && c.title && c.title.startsWith(c.name) ? c.title.slice(c.name.length) : '';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      btn.appendChild(nameSpan);
      if (suffix) {
        const localitySpan = document.createElement('span');
        localitySpan.className = 'autocomplete-locality';
        localitySpan.textContent = suffix;
        btn.appendChild(localitySpan);
      }
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-id', String(c.id || ''));
      btn.dataset.index = String(idx);
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectCandidateIndex(idx);
      });
      btn.addEventListener('mouseover', () => {
        Array.from(acList.children).forEach((ch) => ch.classList.remove('highlighted'));
        btn.classList.add('highlighted');
        highlighted = idx;
      });
      acList.appendChild(btn);
    });
    highlighted = -1;
    acList.classList.add('open');
    try {
      inpStation.setAttribute('aria-expanded', 'true');
    } catch (e) {
      /* ignore */
    }
  }

  function selectCandidateIndex(idx) {
    if (!Array.isArray(lastCandidates) || idx == null || idx < 0 || idx >= lastCandidates.length)
      return;
    const c = lastCandidates[idx];
    if (!c) return;
    inpStation.value = c.name || c.title || c.id || '';
    inpStation.dataset.stopId = String(c.id || '');
    inpStation.dataset.lat = typeof c.lat === 'number' ? String(c.lat) : '';
    inpStation.dataset.lon = typeof c.lon === 'number' ? String(c.lon) : '';
    _explicitSelection = true;
    clearAutocomplete();
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
      clearAutocomplete();
      return;
    }

    lastCandidates = []; // clear stale results immediately

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
        if (inpStation.value === searchQuery) showCandidates(cands);
      } catch (err) {
        if (err?.name === 'AbortError') return; // cancelled by a newer search — normal
        if (_destroyed) return;
        clearAutocomplete();
      }
    }, 250);
  });

  // Keyboard navigation
  inpStation.addEventListener('keydown', (e) => {
    const hasAutocomplete = acList && acList.classList.contains('open');
    const items = hasAutocomplete ? Array.from(acList.children || []) : [];

    if (hasAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlighted = Math.min(items.length - 1, highlighted + 1);
        items.forEach((it) => it.classList.remove('highlighted'));
        if (items[highlighted]) {
          items[highlighted].classList.add('highlighted');
          items[highlighted].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted = Math.max(0, highlighted - 1);
        items.forEach((it) => it.classList.remove('highlighted'));
        if (items[highlighted]) {
          items[highlighted].classList.add('highlighted');
          items[highlighted].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const indexToSelect = highlighted >= 0 ? highlighted : 0;
        if (items.length > 0) selectCandidateIndex(indexToSelect);
        // caller handles focus progression
      } else if (e.key === 'Escape') {
        clearAutocomplete();
      }
    }
    // Enter with no autocomplete: caller handles focus progression via keydown on inpStation
  });

  // Focus: pre-fill + select text
  inpStation.addEventListener('focus', () => {
    lastQuery = '';
    clearAutocomplete();
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
        acList &&
        acList.classList.contains('open') &&
        lastCandidates.length > 0 &&
        !inpStation.dataset.stopId
      ) {
        selectCandidateIndex(0);
      }
      clearAutocomplete();
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
    return !!(acList && acList.classList.contains('open'));
  }

  function reset() {
    lastQuery = '';
    clearAutocomplete();
  }

  function updateField(name, stopId) {
    updatingField = true;
    inpStation.value = name || '';
    inpStation.dataset.stopId = stopId || '';
    inpStation.dataset.lat = '';
    inpStation.dataset.lon = '';
    _explicitSelection = false;
    lastQuery = '';
    clearAutocomplete();
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
    clearAutocomplete();
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
