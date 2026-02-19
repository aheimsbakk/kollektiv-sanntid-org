import { t } from '../i18n.js';

const STORAGE_KEY = 'recent-stations';
const MAX_RECENT = 5;

/**
 * Get recent stations from localStorage
 * @returns {Array<{name: string, stopId: string}>}
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
 * Add or update a station in recent list (moves to top)
 * @param {string} name - Station name
 * @param {string} stopId - Station stop ID
 */
export function addRecentStation(name, stopId) {
  if (!name || !stopId) return;
  
  let recent = getRecentStations();
  
  // Remove if already exists
  recent = recent.filter(s => s.stopId !== stopId);
  
  // Add to top
  recent.unshift({ name, stopId });
  
  // Keep only MAX_RECENT
  if (recent.length > MAX_RECENT) {
    recent = recent.slice(0, MAX_RECENT);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to save recent stations:', e);
  }
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
  
  // Station title button
  const titleBtn = document.createElement('button');
  titleBtn.className = 'station-title';
  titleBtn.setAttribute('aria-haspopup', 'true');
  titleBtn.setAttribute('aria-expanded', 'false');
  titleBtn.textContent = currentStationName || t('noStationSelected');
  
  // Dropdown arrow indicator
  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.textContent = ' ▼';
  titleBtn.appendChild(arrow);
  
  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'station-dropdown-menu';
  menu.setAttribute('role', 'listbox');
  
  let isOpen = false;
  let selectedIndex = -1;
  
  // Populate menu with recent stations
  function populateMenu() {
    const recent = getRecentStations();
    menu.innerHTML = '';
    
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
      item.textContent = station.name;
      item.dataset.stopId = station.stopId;
      item.dataset.name = station.name;
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
    arrow.textContent = isOpen ? ' ▲' : ' ▼';
    
    if (isOpen) {
      populateMenu();
      selectedIndex = -1;
    }
  }
  
  // Close dropdown
  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('open');
    titleBtn.setAttribute('aria-expanded', 'false');
    arrow.textContent = ' ▼';
    selectedIndex = -1;
    
    // Clear selection highlight
    const items = menu.querySelectorAll('.station-dropdown-item');
    items.forEach(item => item.classList.remove('selected'));
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
          const station = {
            name: items[selectedIndex].dataset.name,
            stopId: items[selectedIndex].dataset.stopId
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
  
  // Update station title
  function updateTitle(name) {
    const arrowText = arrow.textContent;
    titleBtn.textContent = name || t('noStationSelected');
    arrow.textContent = arrowText;
    titleBtn.appendChild(arrow);
  }
  
  // Event listeners
  titleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
  
  titleBtn.addEventListener('keydown', handleKeyDown);
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });
  
  // Assemble component
  container.appendChild(titleBtn);
  container.appendChild(menu);
  
  // Expose methods
  container.updateTitle = updateTitle;
  container.refresh = populateMenu;
  
  return container;
}
