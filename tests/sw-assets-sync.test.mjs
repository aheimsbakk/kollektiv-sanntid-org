/**
 * sw-assets-sync.test.mjs
 *
 * Guards the service worker's hand-maintained ASSETS manifest:
 *  - every servable source file under src/ must appear in ASSETS, or offline
 *    mode silently loses it
 *  - every ASSETS entry must exist on disk, or install's cache.addAll() fails
 *    and the whole install aborts
 */
import assert from 'assert/strict';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join, relative, sep } from 'path';
import { fileURLToPath } from 'url';

console.log('Running sw-assets-sync.test.mjs');

const testsDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(testsDir, '..', 'src');

// ── read the ASSETS array out of src/sw.js as plain text ───────────────────
// sw.js is service-worker code (self.addEventListener at top level) and cannot
// be imported in Node, so the list is extracted structurally, not executed.
const swSrc = readFileSync(join(srcDir, 'sw.js'), 'utf-8');
const block = swSrc.match(/const ASSETS = \[([\s\S]*?)\];/);
assert(block, 'ASSETS array not found in src/sw.js');
const assets = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
assert(assets.length > 0, 'ASSETS array is empty');

// ── collect servable source files ──────────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const REQUIRED_EXT = ['.js', '.css', '.html', '.webmanifest', '.svg'];
const sourceFiles = walk(srcDir)
  .map((f) => `./${relative(srcDir, f).split(sep).join('/')}`)
  .filter((f) => REQUIRED_EXT.some((e) => f.endsWith(e)))
  .filter((f) => f !== './sw.js'); // the SW caches itself via the browser, not ASSETS

// ── direction 1: file on disk but not cached ───────────────────────────────
const uncached = sourceFiles.filter((f) => !assets.includes(f));
assert.deepEqual(uncached, [], `src files missing from sw.js ASSETS: ${uncached.join(', ')}`);

// ── direction 2: ASSETS entry with no file on disk ─────────────────────────
const nonexistent = assets
  .filter((a) => a !== './') // './' is the root navigation fallback, not a file
  .filter((a) => !existsSync(join(srcDir, a.slice(2))));
assert.deepEqual(nonexistent, [], `stale ASSETS entries with no file: ${nonexistent.join(', ')}`);

console.log('sw-assets-sync.test.mjs OK');
