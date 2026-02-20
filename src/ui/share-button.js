// Share button component for sharing departure board configuration via URL
import { t } from '../i18n.js';

/**
 * Encode settings to compact base64 URL parameter
 * Uses array format instead of JSON object for 20-30% size reduction
 * @param {Object} settings - Full settings object
 * @returns {string} Base64-encoded compact settings
 */
export function encodeSettings(settings) {
  try {
    // Encode as compact array: [name, stopId, modes, departures, interval, size, lang]
    // This saves ~30% vs JSON object keys
    const data = [
      settings.STATION_NAME,
      settings.STOP_ID,
      settings.TRANSPORT_MODES,
      settings.NUM_DEPARTURES,
      settings.FETCH_INTERVAL,
      settings.TEXT_SIZE,
      settings.language
    ];
    
    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    console.error('Failed to encode settings:', e);
    return null;
  }
}

/**
 * Decode and validate settings from base64 URL parameter
 * @param {string} encoded - Base64-encoded settings
 * @returns {Object|null} Validated settings object or null if invalid
 */
export function decodeSettings(encoded) {
  try {
    // Restore URL-safe base64 to standard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const json = decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(json);
    
    // Support both array format (new) and object format (legacy)
    let n, s, m, d, i, t, l;
    
    if (Array.isArray(data)) {
      // New array format: [name, stopId, modes, departures, interval, size, lang]
      [n, s, m, d, i, t, l] = data;
    } else {
      // Legacy object format
      ({ n, s, m, d, i, t, l } = data);
    }
    
    // Validate all fields
    const settings = {
      stationName: null,
      stopId: null,
      transportModes: [],
      numDepartures: 5,
      fetchInterval: 60,
      textSize: 'large',
      language: 'en'
    };
    
    // Validate station name (required string)
    if (typeof n === 'string' && n.length > 0 && n.length < 200) {
      settings.stationName = n;
    } else {
      return null;
    }
    
    // Validate stop ID (required string, NSR format)
    if (typeof s === 'string' && s.length > 0 && s.length < 100) {
      settings.stopId = s;
    } else {
      return null;
    }
    
    // Validate transport modes (array of valid modes)
    const validModes = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];
    if (Array.isArray(m)) {
      const modes = m.filter(mode => validModes.includes(mode));
      settings.transportModes = modes.length > 0 ? modes : validModes;
    } else {
      settings.transportModes = validModes;
    }
    
    // Validate number of departures (1-20)
    if (typeof d === 'number' && d >= 1 && d <= 20) {
      settings.numDepartures = Math.floor(d);
    }
    
    // Validate fetch interval (minimum 20 seconds, max 300)
    if (typeof i === 'number' && i >= 20 && i <= 300) {
      settings.fetchInterval = Math.floor(i);
    }
    
    // Validate text size (one of the valid sizes)
    const validSizes = ['tiny', 'small', 'medium', 'large', 'xlarge'];
    if (typeof t === 'string' && validSizes.includes(t)) {
      settings.textSize = t;
    }
    
    // Validate language (2-3 letter code)
    if (typeof l === 'string' && /^[a-z]{2,3}$/.test(l)) {
      settings.language = l;
    }
    
    return settings;
  } catch (e) {
    console.error('Failed to decode settings:', e);
    return null;
  }
}

/**
 * Create share button component
 * @param {Function} getSettings - Function that returns current settings object
 * @returns {Object} { button, showUrlBox }
 */
export function createShareButton(getSettings) {
  const button = document.createElement('button');
  button.className = 'header-button share-button';
  button.setAttribute('aria-label', t('shareBoard'));
  button.title = t('shareBoard');
  button.textContent = '🔗';
  
  // URL display box (fallback if clipboard fails)
  const urlBox = document.createElement('div');
  urlBox.className = 'share-url-box';
  urlBox.style.display = 'none';
  
  const urlBoxContent = document.createElement('div');
  urlBoxContent.className = 'share-url-content';
  
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.readOnly = true;
  urlInput.className = 'share-url-input';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('close');
  closeBtn.className = 'share-url-close';
  
  urlBoxContent.appendChild(urlInput);
  urlBoxContent.appendChild(closeBtn);
  urlBox.appendChild(urlBoxContent);
  
  closeBtn.addEventListener('click', () => {
    urlBox.style.display = 'none';
  });
  
  // Click outside to close
  urlBox.addEventListener('click', (e) => {
    if (e.target === urlBox) {
      urlBox.style.display = 'none';
    }
  });
  
  function showUrlBox(url) {
    urlInput.value = url;
    urlBox.style.display = 'flex';
    urlInput.select();
  }
  
  button.addEventListener('click', async () => {
    const settings = getSettings();
    if (!settings || !settings.STATION_NAME || !settings.STOP_ID) {
      alert(t('noStationToShare'));
      return;
    }
    
    const encoded = encodeSettings(settings);
    if (!encoded) {
      alert(t('shareFailed'));
      return;
    }
    
    const url = `${window.location.origin}${window.location.pathname}?b=${encoded}`;
    
    // Try to copy to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      }
    } catch (e) {
      // Ignore clipboard errors - we'll navigate anyway
    }
    
    // Navigate to the URL with the share parameter
    // This allows user to see the full link and share it easily
    window.location.href = url;
  });
  
  return { button, urlBox, showUrlBox };
}
