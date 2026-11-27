/**
 * scroll-more-wheel.js — desktop wheel load-more gesture
 *
 * Accumulates downward wheel deltas near the page bottom. The per-event
 * delta is capped so one fast scroll cannot jump the threshold, and the
 * accumulator resets after WHEEL_RESET_MS of inactivity.
 */

import { SCROLL_MORE } from '../config.js';

/**
 * @param {Object} opts
 * @param {Function} opts.isNearBottom - Gate: only near the bottom deltas count
 * @param {Function} opts.isBlocked    - Gate: suppress while options panel is open
 * @param {Function} opts.onTrigger    - Called when the accumulator passes the threshold
 * @returns {{ bind: Function, destroy: Function, reset: Function }}
 */
export function createWheelGesture({ isNearBottom, isBlocked, onTrigger }) {
  let wheelAccumulator = 0;
  let wheelResetTimer = null;

  function onWheel(e) {
    if (isBlocked()) return;
    if (!isNearBottom()) return;
    if (e.deltaY <= 0) return;

    const MAX_DELTA_PER_EVENT = SCROLL_MORE.WHEEL_THRESHOLD / 2;
    wheelAccumulator += Math.min(e.deltaY, MAX_DELTA_PER_EVENT);

    if (wheelResetTimer) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      wheelAccumulator = 0;
      wheelResetTimer = null;
    }, SCROLL_MORE.WHEEL_RESET_MS);

    if (wheelAccumulator >= SCROLL_MORE.WHEEL_THRESHOLD) {
      wheelAccumulator = 0;
      onTrigger();
    }
  }

  function bind() {
    window.addEventListener('wheel', onWheel, { passive: true });
  }

  function destroy() {
    window.removeEventListener('wheel', onWheel);
    if (wheelResetTimer) clearTimeout(wheelResetTimer);
  }

  /** Drop accumulated deltas and the inactivity timer. */
  function reset() {
    wheelAccumulator = 0;
    if (wheelResetTimer) {
      clearTimeout(wheelResetTimer);
      wheelResetTimer = null;
    }
  }

  return { bind, destroy, reset };
}
