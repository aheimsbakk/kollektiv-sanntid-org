// Minimal UI helpers: create container and manage departure list
export function createBoardElements(stationName){
  const el = document.createElement('div'); el.className='board';
  // station title (used by app.js as .station-title)
  const header = document.createElement('div'); header.className='station-title'; header.textContent = stationName || '';
  // status chip (Live / Demo) should appear under the station title
  const status = document.createElement('div'); status.className='status-chip'; status.style.display='none';
  const list = document.createElement('div'); list.className='departures';
  const headerWrap = document.createElement('div'); headerWrap.className='header-wrap';
  // header-left stacks title and status vertically; header-controls (gear) live to the right
  const headerLeft = document.createElement('div'); headerLeft.className = 'header-left';
  headerLeft.append(header, status);
  headerWrap.append(headerLeft);
  el.append(headerWrap, list);
  // expose header-wrap for other modules to attach controls
  el.headerWrap = headerWrap;
  const debug = document.createElement('pre'); debug.className='debug-panel';
  // expose helper to set debug content; keep it minimal so callers can append
  debug.setDebug = (obj) => {
    try{
      // Use CSS class to control visibility so theming via CSS variables works
      debug.classList.add('open');
      debug.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    }catch(e){ debug.textContent = String(obj); }
  };
  el.append(debug);
  return {el, header, list, status, debug};
}

export function clearList(listEl){
  while(listEl.firstChild) listEl.removeChild(listEl.firstChild);
}

export function findKey(item){
  return `${item.destination}::${item.expectedDepartureISO}`;
}

// Compute minimal diff metadata between old keys and new keys (pure function for testing)
export function computeDiff(oldKeys, newKeys){
  const oldSet = new Set(oldKeys);
  const newSet = new Set(newKeys);
  const toAdd = newKeys.filter(k => !oldSet.has(k));
  const toRemove = oldKeys.filter(k => !newSet.has(k));
  // newOrder is simply newKeys (we'll re-append nodes to match)
  return { toAdd, toRemove, newOrder: newKeys };
}
