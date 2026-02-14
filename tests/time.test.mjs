import assert from 'assert/strict';
import { isoToEpochMs, formatCountdown } from '../src/time.js';

console.log('Running time.test.mjs');
const now = Date.now();
const in90sIso = new Date(now + 90_000).toISOString();
const epoch = isoToEpochMs(in90sIso);
assert(typeof epoch === 'number' && epoch > now, 'isoToEpochMs should return epoch ms');

const formatted = formatCountdown(epoch, now);
// Accept either MM:SS or HH:MM:SS when hours = 0 we'll expect MM:SS
assert(/^[0-9]{2}:[0-9]{2}$/.test(formatted) || formatted === 'Now', 'format should produce MM:SS or Now');

console.log('time.test.mjs OK');

// Additional: when hours > 0 include HH:MM:SS
const longEpoch = now + (2 * 3600 + 5 * 60 + 7) * 1000; // 2:05:07
const longFmt = formatCountdown(longEpoch, now);
assert(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(longFmt), 'format should produce HH:MM:SS when hours>0');

console.log('time.hours.test OK');
