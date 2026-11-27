/**
 * station-dropdown.js — station title button with favorites dropdown (DOM)
 *
 * Presentation only. Favorites storage and CRUD rules live in
 * favorites-store.js, which this module re-exports so existing callers keep
 * working from a single import path.
 */

import { t } from '../i18n.js';
import { STATION_LINE_TEMPLATE, STATION_DROPDOWN } from '../config.js';
import { getRecentStations } from './favorites-store.js';
import { emojiForMode } from './mode-utils.js';

// Backward-compat re-exports: app.js, handlers.js, ui.js, and several test
// suites historically import the favorites API from this module.
export {
  modesEqual,
  getRecentStations,
  getDefaultStation,
  addRecentStation,
  isStationInFavorites,
  removeFromFavorites,
} from './favorites-store.js';

/**
 * Mode order matches the options panel table (left to right, top to bottom):
 * Row 1: bus, metro
 * Row 2: tram, rail
 * Row 3: water, coach
 */
const MODE_ORDER = ['bus', 'metro', 'tram', 'rail', 'water', 'coach'];

/**
 * Get mode icons in consistent order (as they appear in options panel)
 * Returns empty string if all modes are selected (default state)
 * @param {Array<string>} modes
 * @returns {string} Space-separated emoji string
 */
function getModesDisplay(modes) {
  if (!modes || modes.length === 0) return '';

  // If all modes are selected, don't show any icons (default state)
  if (modes.length === MODE_ORDER.length) {
    const allSelected = MODE_ORDER.every((mode) => modes.includes(mode));
    if (allSelected) return '';
  }

  // Sort by MODE_ORDER
  const sorted = modes.slice().sort((a, b) => {
    const idxA = MODE_ORDER.indexOf(a);
    const idxB = MODE_ORDER.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });
  return sorted.map(emojiForMode).join('');
}

/**
 * Create station dropdown component
 * @param {string} currentStationName - Current station name
 * @param {Function} onStationSelect - Callback when station is selected (receives {name, stopId})
 * @returns {HTMLElement}
 */
export function createStationDropdown(currentStationName, onStationSelect) {
  const container = document.createElement('div');
  container.className = 'station-dropdown-container';

  // Station title button; tabIndex=6 in the global tab order
  const titleBtn = document.createElement('button');
  titleBtn.className = 'station-title';
  titleBtn.tabIndex = 6;
  titleBtn.setAttribute('aria-haspopup', 'true');
  titleBtn.setAttribute('aria-expanded', 'false');
  titleBtn.title = t('stationNameTooltip');
  titleBtn.textContent = currentStationName || t('noStationSelected');

  // Dropdown arrow indicator
  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.textContent = ' ' + STATION_DROPDOWN.ARROW_COLLAPSED;
  titleBtn.appendChild(arrow);

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'station-dropdown-menu';
  menu.setAttribute('role', 'listbox');

  let isOpen = false;
  let selectedIndex = -1;

  // Explicitly remove listeners from existing menu children before clearing
  function _clearMenuItems() {
    Array.from(menu.children).forEach((child) => {
      const clone = child.cloneNode(false);
      child.replaceWith(clone);
    });
    menu.innerHTML = '';
  }

  // Populate menu with recent stations
  function populateMenu() {
    const recent = getRecentStations();
    _clearMenuItems();

    if (recent.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'station-dropdown-empty';
      emptyMsg.textContent = t('noRecentStations');
      menu.appendChild(emptyMsg);
      return;
    }

    recent.forEach((station, index) => {
      const item = document.createElement('button');
      item.className = 'station-dropdown-item';
      item.setAttribute('role', 'option');

      // Render from STATION_LINE_TEMPLATE — {modes} is '' when all modes selected
      item.textContent = STATION_LINE_TEMPLATE.replace('{name}', station.name)
        .replace('{modes}', getModesDisplay(station.modes))
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

      item.dataset.stopId = station.stopId;
      item.dataset.name = station.name;
      item.dataset.modes = JSON.stringify(station.modes || []);
      item.dataset.lat = typeof station.lat === 'number' ? String(station.lat) : '';
      item.dataset.lon = typeof station.lon === 'number' ? String(station.lon) : '';
      item.dataset.index = index;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectStation(station);
      });

      menu.appendChild(item);
    });
  }

  // Toggle dropdown
  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      menu.classList.add('open');
    } else {
      menu.classList.remove('open');
    }
    titleBtn.setAttribute('aria-expanded', isOpen.toString());
    arrow.textContent = isOpen
      ? ' ' + STATION_DROPDOWN.ARROW_EXPANDED
      : ' ' + STATION_DROPDOWN.ARROW_COLLAPSED;

    if (isOpen) {
      populateMenu();
      selectedIndex = -1;
      titleBtn.focus();
    }
  }

  // Close dropdown
  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('open');
    titleBtn.setAttribute('aria-expanded', 'false');
    arrow.textContent = ' ' + STATION_DROPDOWN.ARROW_COLLAPSED;
    selectedIndex = -1;

    // Clear selection highlight
    const items = menu.querySelectorAll('.station-dropdown-item');
    items.forEach((item) => item.classList.remove('selected'));
  }

  // Select station
  function selectStation(station) {
    closeDropdown();
    if (onStationSelect) {
      onStationSelect(station);
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    const items = Array.from(menu.querySelectorAll('.station-dropdown-item'));
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const rawLat = parseFloat(items[selectedIndex].dataset.lat);
          const rawLon = parseFloat(items[selectedIndex].dataset.lon);
          const station = {
            name: items[selectedIndex].dataset.name,
            stopId: items[selectedIndex].dataset.stopId,
            modes: JSON.parse(items[selectedIndex].dataset.modes || '[]'),
            lat: Number.isFinite(rawLat) ? rawLat : undefined,
            lon: Number.isFinite(rawLon) ? rawLon : undefined,
          };
          selectStation(station);
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
    }
  }

  // Update visual selection
  function updateSelection(items) {
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Update station title with optional transport mode icons
  function updateTitle(name, modes = []) {
    const arrowText = arrow.textContent;
    titleBtn.textContent = name || t('noStationSelected');

    // Add mode icons if there's a filter (not all modes selected)
    const modesDisplay = getModesDisplay(modes);
    if (modesDisplay) {
      titleBtn.textContent += ' ' + modesDisplay;
    }

    arrow.textContent = arrowText;
    titleBtn.appendChild(arrow);
  }

  // Named outside-click handler so it can be removed on destroy
  function _onDocClick(e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  }

  // Event listeners
  titleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  titleBtn.addEventListener('keydown', handleKeyDown);

  // Close on outside click
  document.addEventListener('click', _onDocClick);

  // Assemble component
  container.appendChild(titleBtn);
  container.appendChild(menu);

  // Expose methods
  container.updateTitle = updateTitle;
  container.refresh = populateMenu;

  /** Remove the document-level listener and release DOM references. */
  container.destroy = function () {
    document.removeEventListener('click', _onDocClick);
    titleBtn.removeEventListener('keydown', handleKeyDown);
    _clearMenuItems();
  };

  return container;
}
