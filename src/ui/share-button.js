// Share button component for sharing departure board configuration via URL
import { t } from '../i18n.js';

/**
 * Encode settings to compressed base64 URL parameter
 * @param {Object} settings - Full settings object
 * @returns {string} Base64-encoded compressed settings
 */
export function encodeSettings(settings) {
  try {
    // Create minimal settings object
    const data = {
      n: settings.STATION_NAME,
      s: settings.STOP_ID,
      m: settings.TRANSPORT_MODES,
      d: settings.NUM_DEPARTURES,
      i: settings.FETCH_INTERVAL,
      t: settings.TEXT_SIZE,
      l: settings.language
    };
    
    const json = JSON.stringify(data);
    
    // Simple compression: use URL-safe base64
    // For better compression in future, could use pako or similar
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
    if (typeof data.n === 'string' && data.n.length > 0 && data.n.length < 200) {
      settings.stationName = data.n;
    } else {
      return null;
    }
    
    // Validate stop ID (required string, NSR format)
    if (typeof data.s === 'string' && data.s.length > 0 && data.s.length < 100) {
      settings.stopId = data.s;
    } else {
      return null;
    }
    
    // Validate transport modes (array of valid modes)
    const validModes = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];
    if (Array.isArray(data.m)) {
      const modes = data.m.filter(m => validModes.includes(m));
      settings.transportModes = modes.length > 0 ? modes : validModes;
    } else {
      settings.transportModes = validModes;
    }
    
    // Validate number of departures (1-20)
    if (typeof data.d === 'number' && data.d >= 1 && data.d <= 20) {
      settings.numDepartures = Math.floor(data.d);
    }
    
    // Validate fetch interval (minimum 20 seconds, max 300)
    if (typeof data.i === 'number' && data.i >= 20 && data.i <= 300) {
      settings.fetchInterval = Math.floor(data.i);
    }
    
    // Validate text size (one of the valid sizes)
    const validSizes = ['tiny', 'small', 'medium', 'large', 'xlarge'];
    if (typeof data.t === 'string' && validSizes.includes(data.t)) {
      settings.textSize = data.t;
    }
    
    // Validate language (2-3 letter code)
    if (typeof data.l === 'string' && /^[a-z]{2,3}$/.test(data.l)) {
      settings.language = data.l;
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
    
    const url = `${window.location.origin}${window.location.pathname}?board=${encoded}`;
    
    // Try to copy to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        // Show brief success indicator
        const originalText = button.textContent;
        button.textContent = '✓';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      } else {
        // Fallback: show URL in box
        showUrlBox(url);
      }
    } catch (e) {
      // Fallback: show URL in box
      showUrlBox(url);
    }
  });
  
  return { button, urlBox, showUrlBox };
}
