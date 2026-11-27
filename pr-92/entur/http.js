/**
 * http.js — Low-level HTTP transport for the Entur API
 *
 * Handles fetch POST, response validation, JSON extraction, and request
 * timeouts. No business logic — purely concerned with the network layer.
 */

import { NETWORK_TIMEOUT_MS } from '../config.js';

/**
 * Build an abort signal that fires after `timeoutMs`, chained with an optional
 * external signal so caller-side cancellation (e.g. superseded searches) still
 * works. Uses controller + timer rather than AbortSignal.timeout because the
 * supported browser baseline (Safari 15) lacks it.
 *
 * Callers MUST call `done()` once the fetch settles to clear the timer and
 * listener (RULES §13 resource cleanup).
 *
 * @param {number}      timeoutMs      - Abort the request after this many ms
 * @param {AbortSignal} [externalSignal] - Optional caller signal to chain
 * @returns {{ signal: AbortSignal, done: Function }}
 */
export function createTimeoutSignal(timeoutMs, externalSignal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const relayAbort = () => ctrl.abort();
  if (externalSignal) {
    if (externalSignal.aborted) ctrl.abort();
    else externalSignal.addEventListener('abort', relayAbort, { once: true });
  }
  return {
    signal: ctrl.signal,
    done: () => {
      clearTimeout(timer);
      if (externalSignal) externalSignal.removeEventListener('abort', relayAbort);
    },
  };
}

/**
 * Normalise the Content-Type header from various fetch response shapes.
 * Works with Headers objects (browser), plain objects, and test stubs.
 * @param {Response} resp
 * @returns {string}
 */
export function getContentType(resp) {
  if (!resp || !resp.headers) return '';
  if (typeof resp.headers.get === 'function') return resp.headers.get('content-type') || '';
  return resp.headers['content-type'] || resp.headers['Content-Type'] || '';
}

/**
 * POST a GraphQL query to the Entur endpoint and parse the JSON response.
 * Throws on network errors, timed-out requests, and non-JSON responses.
 *
 * @param {string}   apiUrl
 * @param {string}   clientName
 * @param {Function} fetchFn
 * @param {string}   query
 * @param {Object|null} variables
 * @param {number}   [timeoutMs=NETWORK_TIMEOUT_MS] - Abort the request after this many ms
 * @returns {Promise<{ json: Object, resp: Response }>}
 */
export async function postAndParse(
  apiUrl,
  clientName,
  fetchFn,
  query,
  variables,
  timeoutMs = NETWORK_TIMEOUT_MS
) {
  const payload = variables ? { query, variables } : { query };
  const { signal, done } = createTimeoutSignal(timeoutMs);
  let resp;
  try {
    resp = await fetchFn(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ET-Client-Name': clientName,
      },
      signal,
      body: JSON.stringify(payload),
    });
  } finally {
    done();
  }

  if (!resp) throw new Error('Empty response from fetch');

  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    const txt =
      typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new Error(
      `Network error: ${resp.status ?? 'unknown'} ${resp.statusText ?? ''} — ${String(txt).slice(0, 200)}`
    );
  }

  const contentType = getContentType(resp);
  if (contentType && !/application\/json/i.test(contentType)) {
    const txt =
      typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new SyntaxError(`Non-JSON response: ${String(txt).slice(0, 200)}`);
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    throw new SyntaxError(`Failed to parse JSON response: ${err?.message ?? String(err)}`);
  }

  return { json, resp };
}
