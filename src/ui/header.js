export function createHeaderToggle(onToggle){
  const el = document.createElement('div'); el.className='header-controls';
  const btn = document.createElement('button'); btn.type='button'; btn.className='gear-btn'; btn.setAttribute('aria-label','Settings');
  btn.innerHTML = '&#9881;'; // simple gear
  btn.addEventListener('click', ()=>{ onToggle && onToggle(); if (window.__APP_OPTIONS__ && typeof window.__APP_OPTIONS__.open === 'function') window.__APP_OPTIONS__.open(); });
  el.append(btn);
  return {el, btn};
}
