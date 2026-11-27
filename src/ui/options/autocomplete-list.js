/**
 * autocomplete-list.js — floating candidate list for station search
 *
 * Owns the listbox DOM and highlight state: renders candidates (bare name
 * at full opacity, locality suffix dimmed), tracks keyboard/mouse
 * highlighting, and reports selections by index. Debounced search and the
 * input wiring live in station-autocomplete.js.
 */

/**
 * @param {Object}   opts
 * @param {HTMLElement} opts.acWrap       - Wrapper the floating list is appended to
 * @param {HTMLElement} opts.ariaInput    - Input whose aria-expanded attribute is synced
 * @param {Function}    opts.onSelectIndex - Called with the candidate index on mousedown
 * @returns {{
 *   show: (cands: Array) => void,
 *   clear: () => void,
 *   isOpen: () => boolean,
 *   items: () => HTMLElement[],
 *   candidates: () => Array,
 *   highlighted: () => number,
 *   moveHighlight: (delta: number) => number,
 *   clearHighlight: () => void,
 * }}
 */
export function createCandidateList({ acWrap, ariaInput, onSelectIndex }) {
  let acList = null;
  let highlighted = -1;
  let lastCandidates = [];

  function clear() {
    try {
      if (acList && acList.parentElement) acList.parentElement.removeChild(acList);
    } catch (e) {
      /* detached already — nothing to remove */
    }
    acList = null;
    highlighted = -1;
    lastCandidates = [];
  }

  /** Render (or re-render) the candidate buttons and open the list. */
  function show(cands) {
    lastCandidates = Array.isArray(cands) ? cands.slice() : [];
    if (lastCandidates.length === 0) {
      clear();
      return;
    }

    if (!acList) {
      acList = document.createElement('div');
      acList.className = 'station-autocomplete-list';
      acList.id = 'station-autocomplete-list';
      acList.setAttribute('role', 'listbox');
      acWrap.appendChild(acList);
    }
    acList.innerHTML = '';
    lastCandidates.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      // Render bare name at full opacity; locality suffix (e.g. ", Oslo") dimmed
      const name = c.name || c.title || '';
      const suffix =
        c.name && c.title && c.title.startsWith(c.name) ? c.title.slice(c.name.length) : '';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      btn.appendChild(nameSpan);
      if (suffix) {
        const localitySpan = document.createElement('span');
        localitySpan.className = 'autocomplete-locality';
        localitySpan.textContent = suffix;
        btn.appendChild(localitySpan);
      }
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-id', String(c.id || ''));
      btn.dataset.index = String(idx);
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onSelectIndex(idx);
      });
      btn.addEventListener('mouseover', () => {
        clearHighlight();
        btn.classList.add('highlighted');
        highlighted = idx;
      });
      acList.appendChild(btn);
    });
    highlighted = -1;
    acList.classList.add('open');
    try {
      ariaInput.setAttribute('aria-expanded', 'true');
    } catch (e) {
      /* attribute setting is best-effort */
    }
  }

  function items() {
    return acList ? Array.from(acList.children || []) : [];
  }

  /** Move the highlight by delta (clamped); returns the new highlight index. */
  function moveHighlight(delta) {
    const list = items();
    if (list.length === 0) return -1;
    highlighted = Math.max(0, Math.min(list.length - 1, highlighted + delta));
    clearHighlight();
    list[highlighted].classList.add('highlighted');
    list[highlighted].scrollIntoView({ block: 'nearest' });
    return highlighted;
  }

  function clearHighlight() {
    items().forEach((it) => it.classList.remove('highlighted'));
  }

  function isOpen() {
    return !!(acList && acList.classList.contains('open'));
  }

  return {
    show,
    clear,
    isOpen,
    items,
    candidates: () => lastCandidates,
    highlighted: () => highlighted,
    moveHighlight,
    clearHighlight,
  };
}
