/**
 * ui.emoji.test.mjs — transport mode display helpers
 *
 * Tests the pure functions in src/ui/mode-utils.js. The older version of this
 * file asserted against DOM nodes returned by createDepartureNode, which needs
 * a browser. These helpers are the single source of truth for the emoji and
 * label that the departure row shows, so testing them directly keeps the
 * coverage hermetic.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emojiForMode, labelForMode } from '../src/ui/mode-utils.js';
import { TRANSPORT_MODE_EMOJIS } from '../src/config.js';

test('emojiForMode maps canonical modes to their emoji', () => {
  const cases = [
    ['bus', TRANSPORT_MODE_EMOJIS.bus],
    ['tram', TRANSPORT_MODE_EMOJIS.tram],
    ['metro', TRANSPORT_MODE_EMOJIS.metro],
    ['rail', TRANSPORT_MODE_EMOJIS.rail],
    ['water', TRANSPORT_MODE_EMOJIS.water],
    ['coach', TRANSPORT_MODE_EMOJIS.coach],
  ];
  for (const [mode, emoji] of cases) {
    assert.equal(emojiForMode(mode), emoji, `${mode} should map to its emoji`);
  }
});

test('emojiForMode accepts localised Norwegian aliases', () => {
  const cases = [
    ['trikk', TRANSPORT_MODE_EMOJIS.tram],
    ['t-bane', TRANSPORT_MODE_EMOJIS.metro],
    ['tbane', TRANSPORT_MODE_EMOJIS.metro],
    ['tog', TRANSPORT_MODE_EMOJIS.rail],
    ['ferje', TRANSPORT_MODE_EMOJIS.water],
    ['båt', TRANSPORT_MODE_EMOJIS.default], // 'båt' is not an ASCII 'boat' match
  ];
  for (const [mode, emoji] of cases) {
    assert.equal(emojiForMode(mode), emoji, `${mode} should map to the expected emoji`);
  }
});

test('emojiForMode falls back to the default emoji', () => {
  for (const mode of [null, undefined, '', 'airplane', 'unknown-mode']) {
    assert.equal(
      emojiForMode(mode),
      TRANSPORT_MODE_EMOJIS.default,
      `${String(mode)} should fall back to the default emoji`
    );
  }
});

test('labelForMode returns capitalised English labels', () => {
  const cases = [
    ['bus', 'Bus'],
    ['trikk', 'Tram'],
    ['tbane', 'Metro'],
    ['train', 'Train'],
    ['ferry', 'Ferry'],
    ['coach', 'Coach'],
  ];
  for (const [mode, label] of cases) {
    assert.equal(labelForMode(mode), label, `${mode} should label as ${label}`);
  }
});

test('labelForMode returns an empty string for unknown input', () => {
  for (const mode of [null, undefined, '', 'airplane']) {
    assert.equal(labelForMode(mode), '', `${String(mode)} should label as an empty string`);
  }
});
