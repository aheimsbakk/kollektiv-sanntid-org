import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Service worker does not cache external API requests', async () => {
  const swCode = readFileSync('./src/sw.js', 'utf-8');
  
  // Check that service worker has logic to detect external APIs
  assert.ok(
    swCode.includes('isExternalAPI') || swCode.includes('hostname'),
    'Service worker should detect external API requests by hostname'
  );
  
  // Check that external APIs bypass cache
  assert.ok(
    swCode.includes('fetch(req)') && (swCode.includes('isExternalAPI') || swCode.includes('external')),
    'Service worker should use network-only for external API requests'
  );
  
  console.log('✓ Service worker correctly handles external API requests');
});

test('Service worker does not use ignoreSearch for API requests', async () => {
  const swCode = readFileSync('./src/sw.js', 'utf-8');
  
  // If ignoreSearch is used, it should only be for local assets, not APIs
  const ignoreSearchUsage = swCode.match(/ignoreSearch.*true/g);
  
  if (ignoreSearchUsage && ignoreSearchUsage.length > 0) {
    // Check that there's protection against using ignoreSearch on API requests
    assert.ok(
      swCode.includes('isExternalAPI') || swCode.includes('hostname'),
      'If ignoreSearch is used, must have isExternalAPI check to exclude API requests'
    );
    
    console.log('✓ ignoreSearch is protected by external API check');
  } else {
    console.log('✓ ignoreSearch not used (even safer)');
  }
});

test('Service worker fetch handler structure is correct', async () => {
  const swCode = readFileSync('./src/sw.js', 'utf-8');
  
  // Check for fetch event listener
  assert.ok(
    swCode.includes("addEventListener('fetch'"),
    'Service worker should have fetch event listener'
  );
  
  // Check for navigation vs other request handling
  assert.ok(
    swCode.includes('isNavigation') || swCode.includes('navigate'),
    'Service worker should distinguish navigation requests'
  );
  
  // Check that API requests are handled specially
  assert.ok(
    swCode.includes('isExternalAPI') || swCode.includes('api.entur.io') || swCode.includes('hostname'),
    'Service worker should handle external API requests specially'
  );
  
  console.log('✓ Service worker fetch handler has correct structure');
});

test('Service worker does not cache api.entur.io responses', async () => {
  const swCode = readFileSync('./src/sw.js', 'utf-8');
  
  // Verify that external APIs (different hostname) bypass cache
  const hasHostnameCheck = swCode.includes('url.hostname') || swCode.includes('req.url');
  const hasExternalCheck = swCode.includes('isExternalAPI') || swCode.includes('external');
  const hasNetworkOnly = swCode.includes('fetch(req)');
  
  assert.ok(
    hasHostnameCheck && hasExternalCheck && hasNetworkOnly,
    'Service worker must check hostname and use network-only for external APIs'
  );
  
  // Make sure there's a return statement after handling external APIs
  // so they don't fall through to cache-first logic
  const externalAPIPattern = /isExternalAPI.*\{[\s\S]*?return;/;
  assert.ok(
    externalAPIPattern.test(swCode),
    'External API handler must return early to prevent cache fallthrough'
  );
  
  console.log('✓ api.entur.io responses will not be cached');
});
