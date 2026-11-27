/**
 * scroll-more.js — Scroll/pull-to-load-more departures (orchestrator)
 *
 * Responsibilities:
 *   - Track a temporary departure count that overrides DEFAULTS.NUM_DEPARTURES
 *   - Fibonacci-like progression: 1, 2, 3, 5, 8, 13, 21 (max)
 *   - Own the indicator element and the load-more trigger (debounced)
 *   - Delegate raw gesture detection to scroll-more-pointer.js (touch/mouse
 *     pull) and scroll-more-wheel.js (desktop wheel)
 *   - Reset temporary count on station change or app reload
 *
 * Design constraints:
 *   - No visual drag displacement — no marginTop manipulation
 *   - No CSS transitions or snap-back animation
 *   - No external dependencies
 *   - Works on PC, Android, macOS, iOS (touch + mouse + wheel)
 *   - Resistance threshold prevents accidental loading
 *   - Memory-safe: all listeners cleaned up via destroy()
 */

import { DEFAULTS, SCROLL_MORE } from '../config.js';
import { t } from '../i18n.js';
import { createPointerGesture } from './scroll-more-pointer.js';
import { createWheelGesture } from './scroll-more-wheel.js';

const SCROLL_STEPS = SCROLL_MORE.SCROLL_STEPS;
const MAX_HINT_DURATION = SCROLL_MORE.MAX_HINT_DURATION;

/**
 * Module-level reference to the active instance.
 * Prevents duplicate window listeners on accidental double-init.
 * @type {{ destroy: Function } | null}
 */
let _activeInstance = null;

/**
 * Find the next step in the Fibonacci progression.
 * Returns null when already at (or above) the maximum.
 * @param {number} current
 * @returns {number|null}
 */
export function getNextStep(current) {
  for (const step of SCROLL_STEPS) {
    if (step > current) return step;
  }
  return null;
}

/**
 * Check whether the given count has reached the maximum scroll step.
 * @param {number} count
 * @returns {boolean}
 */
export function isAtMax(count) {
  return count >= SCROLL_STEPS[SCROLL_STEPS.length - 1];
}

/**
 * Initialise the scroll-more feature on a board.
 *
 * @param {Object}      opts
 * @param {HTMLElement} opts.boardEl    - The .board element
 * @param {HTMLElement} opts.listEl     - The .departures element
 * @param {Function}    opts.onLoadMore - Callback(newCount) to fetch more departures
 * @returns {{ destroy: Function, reset: Function, indicatorEl: HTMLElement, getTemporaryCount: Function, updateTranslations: Function }}
 */
export function initScrollMore({ boardEl, listEl, onLoadMore }) {
  if (_activeInstance !== null) {
    console.warn('scroll-more: double-init detected — destroying previous instance');
    _activeInstance.destroy();
    _activeInstance = null;
  }

  /** Current temporary departure count (null = use DEFAULTS.NUM_DEPARTURES) */
  let tempCount = null;

  /** Whether a load-more fetch is currently in flight */
  let loading = false;

  /** Timer for the max-reached hint auto-dismiss */
  let maxHintTimer = null;

  /** Timestamp (ms) of the last load-more trigger — used for debouncing */
  let lastLoadMoreAt = 0;

  // ── Indicator element ──────────────────────────────────────────────

  const indicator = document.createElement('div');
  indicator.className = 'scroll-more-indicator';
  indicator.setAttribute('aria-hidden', 'true');

  const arrow = document.createElement('span');
  arrow.className = 'scroll-more-arrow';
  arrow.textContent = SCROLL_MORE.SYMBOL_ARROW;

  const label = document.createElement('span');
  label.className = 'scroll-more-label';
  label.textContent = t('scrollForMore');

  indicator.append(arrow, label);

  if (listEl.nextSibling) {
    boardEl.insertBefore(indicator, listEl.nextSibling);
  } else {
    boardEl.appendChild(indicator);
  }

  updateIndicator();

  // ── Helpers ────────────────────────────────────────────────────────

  function getEffectiveCount() {
    return tempCount ?? DEFAULTS.NUM_DEPARTURES;
  }

  function updateIndicator() {
    const count = getEffectiveCount();
    if (isAtMax(count)) {
      arrow.textContent = SCROLL_MORE.SYMBOL_MAX;
      arrow.classList.remove('scroll-more-arrow');
      arrow.classList.add('scroll-more-dot');
      label.textContent = '';
      indicator.classList.add('scroll-more-maxed');
      indicator.classList.remove('scroll-more-loading');
    } else {
      arrow.textContent = SCROLL_MORE.SYMBOL_ARROW;
      arrow.classList.remove('scroll-more-dot');
      arrow.classList.add('scroll-more-arrow');
      label.textContent = t('scrollForMore');
      indicator.classList.remove('scroll-more-maxed');
    }
  }

  /** Show temporary "for more change in ⚙️" message */
  function showMaxHint() {
    label.textContent = t('scrollMaxReached');
    if (maxHintTimer) clearTimeout(maxHintTimer);
    maxHintTimer = setTimeout(() => {
      label.textContent = '';
      maxHintTimer = null;
    }, MAX_HINT_DURATION);
  }

  /**
   * Attempt to load the next batch of departures.
   * Respects the Fibonacci progression and calls the onLoadMore callback.
   * A leading-edge debounce (SCROLL_MORE.DEBOUNCE_MS) prevents double-fires.
   */
  async function triggerLoadMore() {
    if (loading) return;

    const now = Date.now();
    if (now - lastLoadMoreAt < SCROLL_MORE.DEBOUNCE_MS) return;
    lastLoadMoreAt = now;

    const current = getEffectiveCount();
    const next = getNextStep(current);

    if (next === null) {
      showMaxHint();
      return;
    }

    loading = true;
    indicator.classList.add('scroll-more-loading');

    try {
      await onLoadMore(next);
      tempCount = next;
    } catch (err) {
      console.warn('Scroll-more load failed', err);
      // tempCount intentionally NOT advanced on failure so the user can retry
    } finally {
      loading = false;
      indicator.classList.remove('scroll-more-loading');
      updateIndicator();
    }
  }

  // ── Gesture gates shared by pointer and wheel ──────────────────────

  /**
   * Returns true when the board fits in the viewport or the page is
   * scrolled near the bottom — the only cases where a pull-up or wheel
   * scroll should trigger load-more.
   */
  function isNearBottom() {
    const boardRect = boardEl.getBoundingClientRect();
    if (boardRect.height <= window.innerHeight) return true;
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    return docHeight - scrollBottom < 60;
  }

  function isBlocked() {
    return document.body.classList.contains('options-open');
  }

  const pointer = createPointerGesture({
    boardEl,
    indicatorEl: indicator,
    isNearBottom,
    isBlocked,
    onTrigger: triggerLoadMore,
  });

  const wheel = createWheelGesture({
    isNearBottom,
    isBlocked,
    onTrigger: triggerLoadMore,
  });

  pointer.bind();
  wheel.bind();

  // ── Public API ─────────────────────────────────────────────────────

  function reset() {
    tempCount = null;
    loading = false;
    lastLoadMoreAt = 0;
    if (maxHintTimer) {
      clearTimeout(maxHintTimer);
      maxHintTimer = null;
    }
    pointer.reset();
    wheel.reset();
    updateIndicator();
  }

  function getTemporaryCount() {
    return getEffectiveCount();
  }

  function updateTranslations() {
    updateIndicator();
  }

  function destroy() {
    pointer.destroy();
    wheel.destroy();
    if (maxHintTimer) clearTimeout(maxHintTimer);
    indicator.remove();
    _activeInstance = null;
  }

  const instance = {
    destroy,
    reset,
    getTemporaryCount,
    updateTranslations,
    indicatorEl: indicator,
  };
  _activeInstance = instance;
  return instance;
}
