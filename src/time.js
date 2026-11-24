// Pure time utilities
export function isoToEpochMs(iso) {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format epoch milliseconds as a clock time (HH:MM) in the browser's local
 * timezone. Returns null for non-numeric or non-finite input.
 *
 * @param {number} targetEpochMs - Target instant as UTC epoch milliseconds
 * @returns {string|null} e.g. "14:05"
 */
export function formatClock(targetEpochMs) {
  if (typeof targetEpochMs !== 'number' || !Number.isFinite(targetEpochMs)) return null;
  const d = new Date(targetEpochMs);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatCountdown(targetEpochMs, nowMs = Date.now(), translator = null) {
  if (typeof targetEpochMs !== 'number') return null;
  const diffMs = targetEpochMs - nowMs;
  if (diffMs <= 0) return translator ? translator('now') : 'Now';
  let totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  totalSec = totalSec % 3600;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}
