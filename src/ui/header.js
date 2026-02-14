export function createHeaderToggle(stationName, onToggle){
  const el = document.createElement('div'); el.className='header-controls';
  const title = document.createElement('div'); title.className='station-title'; title.textContent = stationName || '';
  const btn = document.createElement('button'); btn.type='button'; btn.textContent='Toggle Header';
  btn.addEventListener('click', ()=>{ onToggle && onToggle(); });
  el.append(title, btn);
  return {el, title, btn};
}
