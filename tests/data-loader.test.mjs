import assert from 'assert/strict';
import { parseUploadedJson, getDemoData } from '../src/data-loader.js';

console.log('Running data-loader.test.mjs');

const demo = getDemoData();
assert(Array.isArray(demo) && demo.length>0, 'demo data should parse to array');

const s = JSON.stringify({ data: { stopPlace: { estimatedCalls: [ { expectedDepartureTime:'2026-02-14T15:10:00Z', destinationDisplay:{frontText:'X'}, situations:[] } ] } } });
const parsed = await parseUploadedJson(s);
assert(Array.isArray(parsed) && parsed.length===1, 'parseUploadedJson should parse string JSON');

console.log('data-loader.test.mjs OK');
