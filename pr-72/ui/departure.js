import {
  PLATFORM_SYMBOLS,
  PLATFORM_SYMBOL_RULES,
  DEPARTURE_LINE_TEMPLATE,
  REALTIME_INDICATORS,
} from '../config.js';
import { emojiForMode, labelForMode } from './mode-utils.js';

/**
 * Determine whether a departure is delayed.
 *
 * A departure is considered delayed when ALL of the following are true:
 *   1. Live realtime data is present (item.realtime === true)
 *   2. Both aimed and expected departure ISO strings are available
 *   3. aimedDepartureISO < expectedDepartureISO  (expected is later than aimed)
 *
 * @param {Object} item - Normalised departure object from parseEnturResponse
 * @returns {boolean}
 */
export function isDepartureDelayed(item) {
  if (!item || item.realtime !== true) return false;
  const aimed = item.aimedDepartureISO;
  const expected = item.expectedDepartureISO;
  if (!aimed || !expected) return false;
  return Date.parse(aimed) < Date.parse(expected);
}

export function createDepartureNode(item) {
  const container = document.createElement('div');
  container.className = 'departure';
  const dest = document.createElement('div');
  dest.className = 'departure-destination';

  // time container (countdown separate)
  const time = document.createElement('div');
  time.className = 'departure-time';
  const timeWrap = document.createElement('div');
  timeWrap.className = 'departure-time-wrap';

  // compute epoch ms robustly; store as dataset string only when valid
  const epochMs = item && item.expectedDepartureISO ? Date.parse(item.expectedDepartureISO) : NaN;
  if (Number.isFinite(epochMs)) {
    time.dataset.epochMs = String(epochMs);
  } else {
    time.dataset.epochMs = '';
    time.textContent = '—';
  }

  const situ = document.createElement('div');
  situ.className = 'departure-situations';
  situ.textContent = (item.situations || []).join('; ');

  // The parser (entur/parser.js → entur/modes.js) always sets item.mode on
  // departures from fetchDepartures. Prefer item.mode, fall back to
  // item.transportMode. The old recursive raw-scan fallback was dead code for
  // the normal data path and has been removed (ANALYZE.md issue #10).
  const mode = (item && (item.mode || item.transportMode)) || null;

  // render emoji inline with destination text so it wraps naturally on small screens
  const emoji = emojiForMode(mode);
  const destinationText = item && item.destination ? String(item.destination) : '—';
  const lineNumberText = item && item.publicCode ? String(item.publicCode) : '';

  // Determine realtime indicator and whether this departure is delayed.
  // Delayed = realtime data present AND aimedDepartureISO < expectedDepartureISO.
  // Delayed departures get a solid dot rendered in --danger (red) color.
  const isDelayed = isDepartureDelayed(item);
  const indicatorSymbol =
    item && item.realtime === true ? REALTIME_INDICATORS.realtime : REALTIME_INDICATORS.scheduled;

  // Build indicator as a DOM element so we can apply --danger color independently.
  const indicatorEl = document.createElement('span');
  indicatorEl.textContent = indicatorSymbol;
  if (isDelayed) {
    indicatorEl.className = 'indicator--delayed';
    indicatorEl.setAttribute('aria-label', 'delayed');
  }

  // Build platform/quay display with stacked format: {symbol}<br>{code}
  // Symbol is selected using PLATFORM_SYMBOL_RULES from config.js
  // Rules combine transport mode (authoritative from API) with publicCode pattern
  // to distinguish physical quay types (e.g., bus bay vs bus gate)
  let platformElement = null;
  if (item && item.quay && item.quay.publicCode) {
    const quayCode = String(item.quay.publicCode);

    // Evaluate rules in order to select the symbol
    let symbolKey = 'default';
    for (const rule of PLATFORM_SYMBOL_RULES) {
      // Check transport mode match (if rule specifies modes)
      const modeMatches = !rule.transportMode || rule.transportMode.includes(mode);

      // Check publicCode pattern match (if rule specifies a pattern)
      const patternMatches = !rule.publicCodePattern || rule.publicCodePattern.test(quayCode);

      // If both conditions pass, use this rule's symbol
      if (modeMatches && patternMatches) {
        symbolKey = rule.symbol;
        break;
      }
    }

    const platformSymbol = PLATFORM_SYMBOLS[symbolKey] || PLATFORM_SYMBOLS.default;

    // Create stacked display element — use DOM methods, never innerHTML,
    // because quayCode originates from the Entur API (XSS prevention).
    const stackedSpan = document.createElement('span');
    stackedSpan.className = 'platform-stacked';
    const symSpan = document.createElement('span');
    symSpan.textContent = platformSymbol;
    const codeSpan = document.createElement('span');
    codeSpan.textContent = quayCode;
    stackedSpan.append(symSpan, codeSpan);

    // Store the element for later insertion
    platformElement = stackedSpan;
  }

  // Apply template to build the display line.
  // {platform} and {indicator} are replaced with DOM elements for independent styling.
  // Both use a unique placeholder string that is swapped after textContent assignment.
  const PLATFORM_PLACEHOLDER = '<<<PLATFORM>>>';
  const INDICATOR_PLACEHOLDER = '<<<INDICATOR>>>';
  let displayText = DEPARTURE_LINE_TEMPLATE.replace('{lineNumber}', lineNumberText)
    .replace('{destination}', destinationText)
    .replace('{emoji}', emoji)
    .replace('{indicator}', INDICATOR_PLACEHOLDER)
    .replace('{platform}', platformElement ? PLATFORM_PLACEHOLDER : '');

  // Build the DOM: set text content, then replace placeholders with DOM elements.
  // If departure is cancelled, wrap everything with cancellation styling.
  const isCancelled = item && item.cancellation === true;

  try {
    dest.textContent = displayText;

    // Helper: split current text content on a placeholder and insert a DOM element.
    function insertElement(parent, placeholder, el) {
      // Walk text nodes to find and split the placeholder
      const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.nodeValue.indexOf(placeholder);
        if (idx !== -1) {
          const before = node.nodeValue.slice(0, idx);
          const after = node.nodeValue.slice(idx + placeholder.length);
          const parentNode = node.parentNode;
          if (before) parentNode.insertBefore(document.createTextNode(before), node);
          parentNode.insertBefore(el, node);
          if (after) parentNode.insertBefore(document.createTextNode(after), node);
          parentNode.removeChild(node);
          return;
        }
      }
    }

    // Replace {indicator} placeholder with the indicator span element
    if (displayText.includes(INDICATOR_PLACEHOLDER)) {
      insertElement(dest, INDICATOR_PLACEHOLDER, indicatorEl);
    }

    // Replace {platform} placeholder with the platform stacked element
    if (platformElement && displayText.includes(PLATFORM_PLACEHOLDER)) {
      insertElement(dest, PLATFORM_PLACEHOLDER, platformElement);
    }

    // Wrap with cancellation styling if needed
    if (isCancelled) {
      const wrapper = document.createElement('span');
      wrapper.className = 'departure-cancelled';
      // Move all children into the wrapper
      while (dest.firstChild) {
        wrapper.appendChild(dest.firstChild);
      }
      dest.appendChild(wrapper);
    }
  } catch (e) {
    dest.textContent = destinationText;
  }

  // Provide an accessible textual label matching the visual order (destination + mode).
  // labelForMode from mode-utils.js replaces the local readableMode() closure.
  try {
    const platformText =
      item && item.quay && item.quay.publicCode ? ' Platform ' + item.quay.publicCode : '';
    const linePrefix = lineNumberText ? 'Line ' + lineNumberText + ' ' : '';
    const modeLabel = labelForMode(mode);
    const modeText = modeLabel ? ' ' + modeLabel : '';
    const cancelledPrefix = isCancelled ? 'Cancelled: ' : '';
    dest.setAttribute(
      'aria-label',
      cancelledPrefix + linePrefix + destinationText + modeText + platformText
    );
  } catch (err) {
    console.warn('[departure] aria-label assignment failed', err);
  }

  timeWrap.append(time);
  // place situation between destination and countdown so alerts are read in context
  container.append(dest, situ, timeWrap);
  // store references for quick updates
  return { container, dest, time, situ, epochMs: Number.isFinite(epochMs) ? epochMs : null };
}

export function updateDepartureCountdown(node, nowMs = Date.now(), formatFn, translator = null) {
  if (!node || !node.time || !formatFn) return;
  const v = node.time.dataset.epochMs;
  const epoch = v == null || v === '' ? node.epochMs || null : Number(v);
  if (!Number.isFinite(epoch)) {
    node.time.textContent = '—';
    return;
  }
  const text = formatFn(epoch, nowMs, translator) || '—';
  node.time.textContent = text;
}
