export function createDepartureNode(item){
  const container = document.createElement('div'); container.className='departure';
  const dest = document.createElement('div'); dest.className='departure-destination'; dest.textContent = item.destination || '—';
  const time = document.createElement('div'); time.className='departure-time'; time.textContent = item.expectedDepartureISO || '';
  const situ = document.createElement('div'); situ.className='departure-situations'; situ.textContent = (item.situations || []).join('; ');
  container.append(dest, time, situ);
  // store references for quick updates
  return {container, dest, time, situ};
}
