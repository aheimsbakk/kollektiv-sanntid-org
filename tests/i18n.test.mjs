// Test language detection logic
import assert from 'assert';

// Simulate the detection logic from i18n.js
const translations = {
  en: {}, no: {}, de: {}, es: {}, it: {}, el: {}, fa: {}, hi: {}
};

function detectBrowserLanguage(mockNavigatorLang) {
  const browserLang = mockNavigatorLang;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Map Norwegian variants (nb/nn) to 'no'
  if (langCode === 'nb' || langCode === 'nn') {
    return 'no';
  }
  
  // Check if we support this language
  if (translations[langCode]) {
    return langCode;
  }
  
  // Default to English
  return 'en';
}

// Test cases
const tests = [
  { input: 'en-US', expected: 'en', desc: 'English US' },
  { input: 'en-GB', expected: 'en', desc: 'English GB' },
  { input: 'nb-NO', expected: 'no', desc: 'Norwegian Bokmål' },
  { input: 'nn-NO', expected: 'no', desc: 'Norwegian Nynorsk' },
  { input: 'no', expected: 'no', desc: 'Norwegian generic' },
  { input: 'de-DE', expected: 'de', desc: 'German' },
  { input: 'es-ES', expected: 'es', desc: 'Spanish' },
  { input: 'it-IT', expected: 'it', desc: 'Italian' },
  { input: 'el-GR', expected: 'el', desc: 'Greek' },
  { input: 'fa-IR', expected: 'fa', desc: 'Farsi' },
  { input: 'hi-IN', expected: 'hi', desc: 'Hindi' },
  { input: 'fr-FR', expected: 'en', desc: 'French (unsupported, fallback to en)' },
  { input: 'sv-SE', expected: 'en', desc: 'Swedish (unsupported, fallback to en)' }
];

console.log('Testing language detection...');
let passed = 0;
let failed = 0;

tests.forEach(test => {
  const result = detectBrowserLanguage(test.input);
  try {
    assert.strictEqual(result, test.expected, `${test.desc}: expected ${test.expected}, got ${result}`);
    console.log(`✓ ${test.desc}: ${test.input} → ${result}`);
    passed++;
  } catch (e) {
    console.error(`✗ ${test.desc}: ${e.message}`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}

console.log('i18n.test.mjs OK');
