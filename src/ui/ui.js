// Minimal UI helpers: create container and manage departure list
export function createBoardElements(stationName){
  const el = document.createElement('div'); el.className='board';
  const header = document.createElement('div'); header.className='station-header'; header.textContent = stationName || '';
  const list = document.createElement('div'); list.className='departures';
  el.append(header, list);
  return {el, header, list};
}

export function clearList(listEl){
  while(listEl.firstChild) listEl.removeChild(listEl.firstChild);
}

export function findKey(item){
  return `${item.destination}::${item.expectedDepartureISO}`;
}
