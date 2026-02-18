#!/usr/bin/env node
/**
 * Test: Service Worker version and cache handling
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swPath = join(__dirname, '../src/sw.js');
const configPath = join(__dirname, '../src/config.js');
const appPath = join(__dirname, '../src/app.js');

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}`);
      console.error(`  ${err.message}`);
      failed++;
    }
  }

  // Read service worker file
  const swContent = readFileSync(swPath, 'utf-8');
  const configContent = readFileSync(configPath, 'utf-8');
  const appContent = readFileSync(appPath, 'utf-8');

  test('Service worker has VERSION constant', () => {
    const hasVersion = /const VERSION = '[0-9]+\.[0-9]+\.[0-9]+';/.test(swContent);
    if (!hasVersion) {
      throw new Error('VERSION constant not found or invalid format');
    }
  });

  test('CACHE_NAME uses VERSION variable', () => {
    const hasDynamicCache = /const CACHE_NAME = [`']departures-v\$\{VERSION\}[`'];/.test(swContent);
    if (!hasDynamicCache) {
      throw new Error('CACHE_NAME should use template literal with VERSION');
    }
  });

  test('VERSION follows SemVer format (x.y.z)', () => {
    const versionMatch = swContent.match(/const VERSION = '([0-9]+\.[0-9]+\.[0-9]+)';/);
    if (!versionMatch) {
      throw new Error('VERSION not in SemVer format (x.y.z)');
    }
    const version = versionMatch[1];
    const parts = version.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid SemVer: ${version}`);
    }
    parts.forEach((part, idx) => {
      if (isNaN(parseInt(part, 10))) {
        throw new Error(`Invalid version part at index ${idx}: ${part}`);
      }
    });
  });

  test('Service worker caches required assets', () => {
    const requiredAssets = ['index.html', 'style.css', 'app.js', 'manifest.webmanifest'];
    requiredAssets.forEach(asset => {
      if (!swContent.includes(`'./${asset}'`) && !swContent.includes(`"./${asset}"`)) {
        throw new Error(`Required asset not found in ASSETS: ${asset}`);
      }
    });
  });

  test('Service worker has install event listener', () => {
    if (!swContent.includes("addEventListener('install'")) {
      throw new Error('Install event listener not found');
    }
  });

  test('Service worker has activate event listener', () => {
    if (!swContent.includes("addEventListener('activate'")) {
      throw new Error('Activate event listener not found');
    }
  });

  test('Service worker has fetch event listener', () => {
    if (!swContent.includes("addEventListener('fetch'")) {
      throw new Error('Fetch event listener not found');
    }
  });

  test('Service worker handles SKIP_WAITING message', () => {
    if (!swContent.includes('SKIP_WAITING') || !swContent.includes('skipWaiting')) {
      throw new Error('SKIP_WAITING message handler not found');
    }
  });

  test('VERSION in sw.js matches VERSION in config.js', () => {
    const swVersionMatch = swContent.match(/const VERSION = '([0-9]+\.[0-9]+\.[0-9]+)';/);
    const configVersionMatch = configContent.match(/export const VERSION = '([0-9]+\.[0-9]+\.[0-9]+)';/);
    
    if (!swVersionMatch) {
      throw new Error('VERSION not found in sw.js');
    }
    if (!configVersionMatch) {
      throw new Error('VERSION not found in config.js');
    }
    
    const swVersion = swVersionMatch[1];
    const configVersion = configVersionMatch[1];
    
    if (swVersion !== configVersion) {
      throw new Error(`Version mismatch: sw.js has '${swVersion}' but config.js has '${configVersion}'`);
    }
  });

  test('App uses auto-reload mechanism (no manual reload buttons)', () => {
    // The old implementation had manual buttons with ids: sw-refresh-btn and sw-dismiss-btn
    // The new implementation should NOT have these
    if (appContent.includes('sw-refresh-btn') || appContent.includes('sw-dismiss-btn')) {
      throw new Error('App still contains manual reload/dismiss buttons (old update mechanism)');
    }
    
    // Verify the new auto-reload mechanism is present
    if (!appContent.includes('showUpdateNotification')) {
      throw new Error('Auto-reload notification function not found');
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50));

  return failed === 0;
}

const success = runTests();
process.exit(success ? 0 : 1);
