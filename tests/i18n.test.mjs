/**
 * i18n.test.mjs — browser language detection
 *
 * Exercises the real `detectBrowserLanguage` from src/i18n/detect.js.
 * The module reads `navigator.language`, so the test installs a navigator
 * stub before each case. Every supported language key in
 * src/i18n/translations.js must resolve to itself; regional variants strip
 * the region suffix; nb/nn collapse to 'no'; anything else falls back to 'en'.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { detectBrowserLanguage } from '../src/i18n/detect.js';
import { translations } from '../src/i18n/translations.js';

// Node exposes a real `navigator`; restore it so later test modules in the
// same process see the untouched global.
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

after(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator);
  }
});

/**
 * Install a minimal navigator stub for one detection call.
 *
 * @param {string|undefined} language value exposed as navigator.language
 */
function withNavigator(language) {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language },
  });
}

test('regional variants resolve to their base language', () => {
  const cases = [
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['de-DE', 'de'],
    ['fr-FR', 'fr'],
    ['pl-PL', 'pl'],
    ['is-IS', 'is'],
    ['uk-UA', 'uk'],
    ['fa-IR', 'fa'],
    ['hi-IN', 'hi'],
    ['el-GR', 'el'],
  ];
  for (const [input, expected] of cases) {
    withNavigator(input);
    assert.equal(detectBrowserLanguage(), expected, `${input} should detect as ${expected}`);
  }
});

test('Norwegian written standards both map to no', () => {
  for (const input of ['nb-NO', 'nn-NO', 'nb', 'nn']) {
    withNavigator(input);
    assert.equal(detectBrowserLanguage(), 'no', `${input} should detect as no`);
  }
});

test('unsupported and missing languages fall back to en', () => {
  for (const input of ['sv-SE', 'pt-BR', 'zh-Hans', '', undefined]) {
    withNavigator(input);
    assert.equal(detectBrowserLanguage(), 'en', `${String(input)} should fall back to en`);
  }
});

test('every supported translation key is detected as itself', () => {
  for (const code of Object.keys(translations)) {
    if (code === 'no') continue; // 'no' only arrives through nb/nn mapping
    withNavigator(code);
    assert.equal(detectBrowserLanguage(), code, `${code} should detect as ${code}`);
  }
});
