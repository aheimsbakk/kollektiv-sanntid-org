/**
 * @file Tests for src/ui/osm-button.js — buildOsmUrl()
 *
 * Tests are hermetic (no DOM, no fetch).
 * buildOsmUrl is a pure function so no mocks are required.
 */

import assert from 'assert/strict';

console.log('Running osm-button.test.mjs');

// Minimal shims so the module can be imported in Node (it references UI_EMOJIS
// and i18n but we don't exercise the DOM parts in this test file).
global.document = {
  createElement: () => ({
    className: '',
    textContent: '',
    title: '',
    type: '',
    tabIndex: 0,
    setAttribute: () => {},
    addEventListener: () => {},
  }),
};

const { buildOsmUrl } = await import('../src/ui/osm-button.js');

// ── buildOsmUrl ───────────────────────────────────────────────────────────────

// Test 1: Basic well-known coordinates (Oslo Central Station)
{
  const url = buildOsmUrl(59.9111, 10.7528);
  assert.ok(url.startsWith('https://www.openstreetmap.org/'), 'URL must start with OSM base');
  assert.ok(url.includes('mlat=59.911100'), 'URL must contain mlat');
  assert.ok(url.includes('mlon=10.752800'), 'URL must contain mlon');
  assert.ok(url.includes('zoom=16'), 'URL must include zoom=16');
  assert.ok(url.includes('layers=T'), 'URL must include Transport layer');
}

// Test 2: Negative coordinates (southern hemisphere / west of meridian)
{
  const url = buildOsmUrl(-33.8688, 151.2093); // Sydney
  assert.ok(url.includes('mlat=-33.868800'), 'Negative lat should be preserved');
  assert.ok(url.includes('mlon=151.209300'), 'Positive lon should be preserved');
}

// Test 3: Coordinates are rounded to 6 decimal places
{
  const url = buildOsmUrl(59.123456789, 10.987654321);
  assert.ok(url.includes('mlat=59.123457'), '6 decimal rounding for lat');
  assert.ok(url.includes('mlon=10.987654'), '6 decimal rounding for lon');
}

// Test 4: Throws on non-number inputs
{
  assert.throws(() => buildOsmUrl('59.9111', 10.7528), TypeError, 'string lat should throw');
  assert.throws(() => buildOsmUrl(59.9111, null), TypeError, 'null lon should throw');
  assert.throws(() => buildOsmUrl(undefined, 10.7528), TypeError, 'undefined lat should throw');
}

// Test 5: Zero coordinates (valid — null island)
{
  const url = buildOsmUrl(0, 0);
  assert.ok(url.includes('mlat=0.000000'), 'Zero lat');
  assert.ok(url.includes('mlon=0.000000'), 'Zero lon');
}

// Test 6: Boundary values
{
  const url = buildOsmUrl(90, 180);
  assert.ok(url.includes('mlat=90.000000'), 'North pole lat');
  assert.ok(url.includes('mlon=180.000000'), 'Date line lon');
}

console.log('osm-button.test.mjs OK');
