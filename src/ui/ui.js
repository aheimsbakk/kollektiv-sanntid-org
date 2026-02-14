// Minimal UI helpers: create container and manage departure list
export function createBoardElements(stationName){
  const el = document.createElement('div'); el.className='board';
  const header = document.createElement('div'); header.className='station-header'; header.textContent = stationName || '';
  const status = document.createElement('div'); status.className='status-chip'; status.style.display='none';
  const banner = document.createElement('div'); banner.className='situation-banner'; banner.style.display='none';
  const list = document.createElement('div'); list.className='departures';
  const headerWrap = document.createElement('div'); headerWrap.className='header-wrap';
  headerWrap.append(header, status);
  el.append(headerWrap, banner, list);
  // expose header-wrap for other modules to attach controls
  el.headerWrap = headerWrap;
  const debug = document.createElement('pre'); debug.className='debug-panel'; debug.style.display='none'; debug.style.maxWidth='90vw'; debug.style.overflow='auto'; debug.style.padding='8px'; debug.style.background='rgba(0,0,0,0.4)'; debug.style.borderRadius='6px'; debug.style.color='var(--fg)';
  // expose helper to set debug content; keep it minimal so callers can append
  debug.setDebug = (obj) => {
    try{
      debug.style.display = 'block';
      debug.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    }catch(e){ debug.textContent = String(obj); }
  };
  el.append(debug);
  return {el, header, list, banner, status, debug};
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
