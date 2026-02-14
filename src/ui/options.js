// Options panel UI: slide-in from right with controls to update DEFAULTS
export function createOptionsPanel(defaults, onApply){
  const panel = document.createElement('aside'); panel.className = 'options-panel';
  const title = document.createElement('h3'); title.textContent = 'Settings';
  panel.appendChild(title);

  // station name
  const rowStation = document.createElement('div'); rowStation.className='options-row';
  const lblStation = document.createElement('label'); lblStation.textContent = 'Station name';
  const inpStation = document.createElement('input'); inpStation.type='text'; inpStation.value = defaults.STATION_NAME || '';
  rowStation.append(lblStation, inpStation);

  // number of departures
  const rowNum = document.createElement('div'); rowNum.className='options-row';
  const lblNum = document.createElement('label'); lblNum.textContent = 'Number of departures';
  const inpNum = document.createElement('input'); inpNum.type='number'; inpNum.min=1; inpNum.value = defaults.NUM_DEPARTURES || 2;
  rowNum.append(lblNum, inpNum);

  // fetch interval
  const rowInt = document.createElement('div'); rowInt.className='options-row';
  const lblInt = document.createElement('label'); lblInt.textContent = 'Fetch interval (seconds)';
  const inpInt = document.createElement('input'); inpInt.type='number'; inpInt.min=5; inpInt.value = defaults.FETCH_INTERVAL || 60;
  rowInt.append(lblInt, inpInt);

  // text size option
  const rowSize = document.createElement('div'); rowSize.className='options-row';
  const lblSize = document.createElement('label'); lblSize.textContent = 'Text size';
  const selSize = document.createElement('select');
  ['tiny','small','medium','large','xlarge'].forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; selSize.appendChild(o); });
  selSize.value = defaults.TEXT_SIZE || 'large';
  rowSize.append(lblSize, selSize);

  // transport modes (multiple checkboxes)
  const rowModes = document.createElement('div'); rowModes.className='options-row';
  const lblModes = document.createElement('label'); lblModes.textContent = 'Transport modes (filter)';
  const modesWrap = document.createElement('div'); modesWrap.className='modes-checkboxes';
  const POSSIBLE = ['bus','tram','metro','rail','water'];
  POSSIBLE.forEach(m => {
    const lab = document.createElement('label');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.value = m; cb.checked = (defaults.TRANSPORT_MODES || []).includes(m);
    const span = document.createElement('span'); span.textContent = m; span.style.marginLeft = '6px';
    lab.append(cb, span);
    modesWrap.append(lab);
  });
  // restore saved choices (if localStorage contains them)
  try{
    const saved = localStorage.getItem('departure:settings');
    if (saved){
      const s = JSON.parse(saved);
      if (Array.isArray(s.TRANSPORT_MODES)){
        Array.from(modesWrap.querySelectorAll('input[type=checkbox]')).forEach(cb=>{ cb.checked = s.TRANSPORT_MODES.includes(cb.value); });
      }
      if (s.STATION_NAME) inpStation.value = s.STATION_NAME;
      if (s.NUM_DEPARTURES) inpNum.value = s.NUM_DEPARTURES;
      if (s.FETCH_INTERVAL) inpInt.value = s.FETCH_INTERVAL;
      if (s.TEXT_SIZE) selSize.value = s.TEXT_SIZE;
    }
  }catch(e){}
  rowModes.append(lblModes, modesWrap);

  const actions = document.createElement('div'); actions.className='options-actions';
  const btnSave = document.createElement('button'); btnSave.type='button'; btnSave.textContent = 'Apply';
  const btnClose = document.createElement('button'); btnClose.type='button'; btnClose.textContent = 'Close';
  actions.append(btnClose, btnSave);

  panel.append(rowStation, rowNum, rowInt, rowModes, actions);

  function open(){ panel.classList.add('open'); }
  function close(){ panel.classList.remove('open'); }

  btnClose.addEventListener('click', ()=> close());
  btnSave.addEventListener('click', ()=>{
    const chosen = Array.from(modesWrap.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
    const newOpts = {
      STATION_NAME: inpStation.value || defaults.STATION_NAME,
      NUM_DEPARTURES: Number(inpNum.value) || defaults.NUM_DEPARTURES,
      FETCH_INTERVAL: Number(inpInt.value) || defaults.FETCH_INTERVAL,
      TRANSPORT_MODES: chosen.length ? chosen : defaults.TRANSPORT_MODES,
      TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large')
    };
    onApply && onApply(newOpts);
    // persist settings
    try{ localStorage.setItem('departure:settings', JSON.stringify(newOpts)); }catch(e){}
    close();
  });

  // when opening/closing, toggle a body class so we can shift the app content
  const origOpen = open;
  open = function(){
    document.body.classList.add('options-open');
    // focus management: save previously focused element and then focus first focusable in panel
    open._prevFocus = document.activeElement;
    origOpen();
    // set focus to first input
    const first = panel.querySelector('input, button, [tabindex]');
    if(first) first.focus();
    // trap focus within panel
    document.addEventListener('keydown', _trap);
    // ESC to close
    document.addEventListener('keydown', _escClose);
  };
  const origClose = close;
  close = function(){
    document.body.classList.remove('options-open');
    origClose();
    // restore focus
    try{ if(open._prevFocus && typeof open._prevFocus.focus === 'function') open._prevFocus.focus(); }catch(e){}
    document.removeEventListener('keydown', _trap);
    document.removeEventListener('keydown', _escClose);
  };

  function _escClose(e){ if (e.key === 'Escape' || e.key === 'Esc') close(); }

  function _trap(e){
    if (e.key !== 'Tab') return;
    const focusables = panel.querySelectorAll('input,button,select,a[href],textarea,[tabindex]:not([tabindex="-1"])');
    if(!focusables || focusables.length===0) return;
    const first = focusables[0];
    const last = focusables[focusables.length-1];
    if (e.shiftKey){ // shift+tab
      if (document.activeElement === first){ e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }

  return { panel, open, close };
}
