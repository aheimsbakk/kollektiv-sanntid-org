import assert from 'assert/strict';
import { isoToEpochMs, formatCountdown, formatClock } from '../src/time.js';

console.log('Running time.test.mjs');
const now = Date.now();
const in90sIso = new Date(now + 90_000).toISOString();
const epoch = isoToEpochMs(in90sIso);
assert(typeof epoch === 'number' && epoch > now, 'isoToEpochMs should return epoch ms');

const formatted = formatCountdown(epoch, now);
// Accept either MM:SS or HH:MM:SS when hours = 0 we'll expect MM:SS
assert(
  /^[0-9]{2}:[0-9]{2}$/.test(formatted) || formatted === 'Now',
  'format should produce MM:SS or Now'
);

console.log('time.test.mjs OK');

// Additional: when hours > 0 include HH:MM:SS
const longEpoch = now + (2 * 3600 + 5 * 60 + 7) * 1000; // 2:05:07
const longFmt = formatCountdown(longEpoch, now);
assert(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(longFmt), 'format should produce HH:MM:SS when hours>0');

console.log('time.hours.test OK');

// formatClock: browser-local wall-clock HH:MM, zero-padded
assert.equal(
  formatClock(new Date(2026, 0, 15, 9, 7, 30).getTime()),
  '09:07',
  'formatClock should zero-pad single-digit hours'
);
assert.equal(
  formatClock(new Date(2026, 0, 15, 14, 5).getTime()),
  '14:05',
  'formatClock should format afternoon times'
);
assert.equal(formatClock(NaN), null, 'formatClock should reject NaN');
assert.equal(formatClock('14:05'), null, 'formatClock should reject non-numbers');

console.log('time.clock.test OK');
