/**
 * scroll-more-pointer.js — upward pull gesture (touch + mouse)
 *
 * Tracks one pointer gesture over the board: downward motion resets, an
 * upward pull past PULL_THRESHOLD highlights the indicator, and release
 * fires onTrigger once. The wheel variant lives in scroll-more-wheel.js.
 */

import { SCROLL_MORE } from '../config.js';

const PULL_THRESHOLD = SCROLL_MORE.PULL_THRESHOLD;

/**
 * @param {Object} opts
 * @param {HTMLElement} opts.boardEl       - Element receiving touch/mouse down
 * @param {HTMLElement} opts.indicatorEl   - Indicator to highlight when triggered
 * @param {Function}    opts.isNearBottom  - Gate: only near the bottom a pull counts
 * @param {Function}    opts.isBlocked     - Gate: suppress while options panel is open
 * @param {Function}    opts.onTrigger     - Called on release once threshold was met
 * @returns {{ bind: Function, destroy: Function, reset: Function }}
 */
export function createPointerGesture({ boardEl, indicatorEl, isNearBottom, isBlocked, onTrigger }) {
  let pointerActive = false;
  let startY = 0;
  /** Raw (un-resisted) pull distance for threshold comparison */
  let rawPullDistance = 0;
  /** Whether the load-more threshold was reached during this gesture */
  let thresholdTriggered = false;

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    if (isBlocked()) return;
    if (!isNearBottom()) return;

    pointerActive = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    rawPullDistance = 0;
    thresholdTriggered = false;

    if (!e.touches && e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    if (!pointerActive) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rawDelta = clientY - startY;

    if (rawDelta >= 0) {
      // Downward — reset tracking
      rawPullDistance = 0;
      return;
    }

    rawPullDistance = Math.abs(rawDelta);

    if (rawPullDistance >= PULL_THRESHOLD && !thresholdTriggered) {
      thresholdTriggered = true;
      indicatorEl.classList.add('scroll-more-indicator--triggered');
    }

    if (e.cancelable && rawPullDistance > 10) {
      e.preventDefault();
    }
  }

  function onPointerEnd() {
    if (!pointerActive) return;
    pointerActive = false;

    indicatorEl.classList.remove('scroll-more-indicator--triggered');

    if (thresholdTriggered) {
      onTrigger();
    }

    rawPullDistance = 0;
    thresholdTriggered = false;
  }

  function bind() {
    boardEl.addEventListener('touchstart', onPointerDown, { passive: true });
    boardEl.addEventListener('touchmove', onPointerMove, { passive: false });
    boardEl.addEventListener('touchend', onPointerEnd, { passive: true });
    boardEl.addEventListener('touchcancel', onPointerEnd, { passive: true });

    boardEl.addEventListener('mousedown', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerEnd);
  }

  function destroy() {
    boardEl.removeEventListener('touchstart', onPointerDown);
    boardEl.removeEventListener('touchmove', onPointerMove);
    boardEl.removeEventListener('touchend', onPointerEnd);
    boardEl.removeEventListener('touchcancel', onPointerEnd);
    boardEl.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerEnd);
  }

  /** Drop in-flight gesture state and the triggered highlight. */
  function reset() {
    pointerActive = false;
    rawPullDistance = 0;
    thresholdTriggered = false;
    indicatorEl.classList.remove('scroll-more-indicator--triggered');
  }

  return { bind, destroy, reset };
}
