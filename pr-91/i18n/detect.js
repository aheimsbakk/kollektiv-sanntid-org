// detect.js — pure browser language detection, no I/O or state
import { translations } from './translations.js';

// Returns the best supported language code for the current browser locale.
function detectBrowserLanguage() {
  // Privacy-restricted browsers and the Node test environment can report no
  // language at all; treat that as "no preference" instead of throwing.
  const browserLang = navigator?.language || navigator?.userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();

  if (!langCode) {
    return 'en';
  }

  // Map Norwegian variants (nb/nn) to 'no'
  if (langCode === 'nb' || langCode === 'nn') {
    return 'no';
  }

  // Return if supported, otherwise fall back to English
  return translations[langCode] ? langCode : 'en';
}

export { detectBrowserLanguage };
