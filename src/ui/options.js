// Options panel UI: slide-in from right with controls to update DEFAULTS
import { searchStations } from '../entur.js';
import { t, setLanguage, getLanguage, getLanguages } from '../i18n.js';

export function createOptionsPanel(defaults, onApply, onLanguageChange){
  const panel = document.createElement('aside'); panel.className = 'options-panel';
  const title = document.createElement('h3'); title.textContent = t('settings');
  panel.appendChild(title);

  // station name
  const rowStation = document.createElement('div'); rowStation.className='options-row';
  const lblStation = document.createElement('label'); lblStation.textContent = t('stationName');
  const inpStation = document.createElement('input'); inpStation.type='text'; inpStation.autocomplete='off'; inpStation.setAttribute('aria-autocomplete','list'); inpStation.value = defaults.STATION_NAME || '';
  rowStation.append(lblStation, inpStation);

  // Autocomplete wrapper & list (visual rules moved to CSS)
  const acWrap = document.createElement('div'); acWrap.className = 'station-autocomplete-wrap';
  // we'll create the list only when needed so it is not in the DOM when unused
  let acList = null;
  // Replace the plain input with the wrapper that contains it + the floating list (list appended on demand)
  rowStation.replaceChild(acWrap, inpStation);
  acWrap.appendChild(inpStation);

  // number of departures
  const rowNum = document.createElement('div'); rowNum.className='options-row';
  const lblNum = document.createElement('label'); lblNum.textContent = t('numberOfDepartures');
  const inpNum = document.createElement('input'); inpNum.type='number'; inpNum.min=1; inpNum.value = defaults.NUM_DEPARTURES || 2;
  rowNum.append(lblNum, inpNum);

  // fetch interval
  const rowInt = document.createElement('div'); rowInt.className='options-row';
  const lblInt = document.createElement('label'); lblInt.textContent = t('fetchInterval');
  const inpInt = document.createElement('input'); inpInt.type='number'; inpInt.min=20; inpInt.value = defaults.FETCH_INTERVAL || 60;
  rowInt.append(lblInt, inpInt);

  // text size option
  const rowSize = document.createElement('div'); rowSize.className='options-row';
  const lblSize = document.createElement('label'); lblSize.textContent = t('textSize');
  const selSize = document.createElement('select');
  const sizeOptions = [
    { value: 'tiny', label: t('tiny') },
    { value: 'small', label: t('small') },
    { value: 'medium', label: t('medium') },
    { value: 'large', label: t('large') },
    { value: 'xlarge', label: t('extraLarge') }
  ];
  sizeOptions.forEach(s=>{ const o=document.createElement('option'); o.value=s.value; o.textContent=s.label; selSize.appendChild(o); });
  selSize.value = defaults.TEXT_SIZE || 'medium';
  rowSize.append(lblSize, selSize);

  // transport modes (multiple checkboxes in table layout)
  const rowModes = document.createElement('div'); rowModes.className='options-row';
  const lblModes = document.createElement('label'); lblModes.textContent = t('transportModes');
  const modesWrap = document.createElement('div'); modesWrap.className='modes-checkboxes';
  
  // Create table structure for 2x3 layout
  const modesTable = document.createElement('table'); modesTable.className = 'modes-table';
  const tbody = document.createElement('tbody');
  
  // Row 1: Bus, Metro
  // Row 2: Tram, Rail
  // Row 3: Water, Coach
  const POSSIBLE = [
    ['bus', 'metro'],
    ['tram', 'rail'],
    ['water', 'coach']
  ];
  
  // helper to map mode -> emoji used in the UI
  const emojiForMode = (mode) => {
    if(!mode) return '🚆';
    const m = String(mode).toLowerCase();
    if(m.includes('bus')) return '🚌';
    if(m.includes('tram') || m.includes('trikk')) return '🚋';
    if(m.includes('metro') || m.includes('t-bane') || m.includes('tbane')) return '🚇';
    if(m.includes('rail') || m.includes('train') || m.includes('tog')) return '🚅';
    if(m.includes('water') || m.includes('ferry') || m.includes('ferje') || m.includes('boat')) return '🛳️';
    if(m.includes('coach')) return '🚍';
    return '🚆';
  };

  POSSIBLE.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(m => {
      const td = document.createElement('td');
      const lab = document.createElement('label'); lab.className = 'mode-checkbox-label';
      const icon = document.createElement('span'); icon.className = 'mode-icon'; icon.setAttribute('aria-hidden','true'); icon.textContent = emojiForMode(m);
      const cb = document.createElement('input'); cb.type='checkbox'; cb.value = m; cb.checked = (defaults.TRANSPORT_MODES || []).includes(m);
      const span = document.createElement('span'); span.textContent = t(m);
      lab.append(icon, cb, span);
      td.appendChild(lab);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  
  modesTable.appendChild(tbody);
  modesWrap.appendChild(modesTable);
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

  // Language switcher
  const rowLang = document.createElement('div'); rowLang.className='options-row';
  const lblLang = document.createElement('label'); lblLang.textContent = t('switchLanguage');
  const langWrap = document.createElement('div'); langWrap.className='language-switcher';
  
  // Function to update all translatable UI elements
  function updateTranslations() {
    title.textContent = t('settings');
    lblStation.textContent = t('stationName');
    lblNum.textContent = t('numberOfDepartures');
    lblInt.textContent = t('fetchInterval');
    lblSize.textContent = t('textSize');
    lblModes.textContent = t('transportModes');
    lblLang.textContent = t('switchLanguage');
    btnSave.textContent = t('apply');
    btnClose.textContent = t('close');
    
    // Update text size options
    const sizeOpts = selSize.querySelectorAll('option');
    sizeOpts[0].textContent = t('tiny');
    sizeOpts[1].textContent = t('small');
    sizeOpts[2].textContent = t('medium');
    sizeOpts[3].textContent = t('large');
    sizeOpts[4].textContent = t('extraLarge');
    
    // Update transport mode labels
    const modeLabels = modesWrap.querySelectorAll('.mode-checkbox-label span:last-child');
    const modeValues = ['bus', 'metro', 'tram', 'rail', 'water', 'coach'];
    modeLabels.forEach((label, idx) => {
      label.textContent = t(modeValues[idx]);
    });
  }
  
  const languages = getLanguages();
  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'language-flag';
    btn.textContent = lang.flag;
    btn.title = lang.name;
    btn.setAttribute('aria-label', lang.name);
    if (getLanguage() === lang.code) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      setLanguage(lang.code);
      // Update all active states
      langWrap.querySelectorAll('.language-flag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Update all translations in the panel
      updateTranslations();
      // Notify external components (e.g., footer) of language change
      if (typeof onLanguageChange === 'function') {
        onLanguageChange();
      }
      showToast(t('languageChanged'));
    });
    langWrap.appendChild(btn);
  });
  
  rowLang.append(lblLang, langWrap);

  const actions = document.createElement('div'); actions.className='options-actions';
  const btnSave = document.createElement('button'); btnSave.type='button'; btnSave.textContent = t('apply');
  const btnClose = document.createElement('button'); btnClose.type='button'; btnClose.textContent = t('close');
  actions.append(btnClose, btnSave);

  panel.append(rowStation, rowNum, rowInt, rowSize, rowModes, rowLang, actions);

  function open(){ panel.classList.add('open'); }
  function close(){ panel.classList.remove('open'); }

  // apply changes without closing the panel unless shouldClose === true
  function applyChanges(shouldClose){
    const chosen = Array.from(modesWrap.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
    
    // Validate number of departures
    let numDepartures = Number(inpNum.value) || defaults.NUM_DEPARTURES;
    if (numDepartures < 1) {
      numDepartures = 1;
      inpNum.value = 1; // Update the input to show corrected value
    }
    
    // Validate fetch interval
    let fetchInterval = Number(inpInt.value) || defaults.FETCH_INTERVAL;
    if (fetchInterval < 20) {
      fetchInterval = 20;
      inpInt.value = 20; // Update the input to show corrected value
    }
    
    const newOpts = {
      STATION_NAME: inpStation.value || defaults.STATION_NAME,
      STOP_ID: inpStation.dataset.stopId || null, // Use stored stopId from autocomplete if available
      NUM_DEPARTURES: numDepartures,
      FETCH_INTERVAL: fetchInterval,
      TRANSPORT_MODES: chosen.length ? chosen : defaults.TRANSPORT_MODES,
      TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large')
    };
    try{ onApply && onApply(newOpts); }catch(e){ console.warn('onApply failed', e); }
    // persist settings immediately
    try{ localStorage.setItem('departure:settings', JSON.stringify(newOpts)); }catch(e){}
    if (shouldClose) close();
  }

  btnClose.addEventListener('click', ()=> close());
  btnSave.addEventListener('click', ()=> applyChanges(true));

  // Enter key navigation: station -> departures -> interval -> text size -> Apply
  inpNum.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      // Validate and enforce minimum value
      const val = inpNum.value.trim();
      if (val === '') {
        // Empty input: restore current value
        inpNum.value = defaults.NUM_DEPARTURES || 2;
      } else {
        const num = Number(val);
        if (num < 1) {
          inpNum.value = 1;
        }
      }
      applyChanges(false);
      inpInt.focus();
    }
  });

  inpInt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      // Validate and enforce minimum value
      const val = inpInt.value.trim();
      if (val === '') {
        // Empty input: restore current value
        inpInt.value = defaults.FETCH_INTERVAL || 60;
      } else {
        const num = Number(val);
        if (num < 20) {
          inpInt.value = 20;
        }
      }
      applyChanges(false);
      selSize.focus();
    }
  });

  selSize.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      btnSave.focus();
    }
  });

  // Validate number of departures on blur
  inpNum.addEventListener('blur', () => {
    const val = inpNum.value.trim();
    if (val === '') {
      // Empty input: restore current value
      inpNum.value = defaults.NUM_DEPARTURES || 2;
    } else {
      const num = Number(val);
      if (num < 1) {
        inpNum.value = 1;
      }
    }
  });

  // Validate fetch interval on blur
  inpInt.addEventListener('blur', () => {
    const val = inpInt.value.trim();
    if (val === '') {
      // Empty input: restore current value
      inpInt.value = defaults.FETCH_INTERVAL || 60;
    } else {
      const num = Number(val);
      if (num < 20) {
        inpInt.value = 20;
      }
    }
  });

  // Auto-select text on focus for easy editing
  inpStation.addEventListener('focus', () => {
    inpStation.select();
  });

  inpNum.addEventListener('focus', () => {
    inpNum.select();
  });

  inpInt.addEventListener('focus', () => {
    inpInt.select();
  });

  // Station autocomplete behaviour: query after 3 characters and show up to 5 matches
  let acTimer = null;
  let lastQuery = '';
  let highlighted = -1;
  let lastCandidates = [];
  function clearAutocomplete(){
    try{
      if (acList && acList.parentElement) acList.parentElement.removeChild(acList);
    }catch(e){}
    acList = null;
    highlighted = -1;
    lastCandidates = [];
  }
  function selectCandidateIndex(idx){
    if (!Array.isArray(lastCandidates) || idx == null || idx < 0 || idx >= lastCandidates.length) return;
    const c = lastCandidates[idx];
    if (!c) return;
    inpStation.value = c.title || c.id || '';
    inpStation.dataset.stopId = String(c.id || '');
    clearAutocomplete();
    applyChanges(false);
  }
  function showCandidates(cands){
    lastCandidates = Array.isArray(cands) ? cands.slice(0) : [];
    if (!Array.isArray(lastCandidates) || lastCandidates.length === 0){ clearAutocomplete(); return; }
    // create list if needed
    if (!acList){
      acList = document.createElement('ul');
      acList.className = 'station-autocomplete-list';
      acList.id = 'station-autocomplete-list';
      acList.setAttribute('role','listbox');
      acWrap.appendChild(acList);
    }
    acList.innerHTML = '';
    lastCandidates.forEach((c, idx) => {
      const li = document.createElement('li'); li.textContent = c.title || c.id || '';
      li.setAttribute('role','option'); li.setAttribute('data-id', String(c.id || ''));
      li.dataset.index = String(idx);
      li.addEventListener('mousedown', (e) => { // use mousedown to handle selection before blur
        e.preventDefault();
        selectCandidateIndex(idx);
      });
      li.addEventListener('mouseover', () => { Array.from(acList.children).forEach(ch => ch.classList.remove('highlighted')); li.classList.add('highlighted'); highlighted = idx; });
      acList.appendChild(li);
    });
    highlighted = -1;
    acList.classList.add('open');
    // manage ARIA on the input
    try{ inpStation.setAttribute('aria-expanded','true'); }catch(e){}
  }

  inpStation.addEventListener('input', (e) => {
    const v = String(inpStation.value || '');
    if (v === lastQuery) return;
    lastQuery = v;
    // Clear stored stopId when user manually types (not selecting from autocomplete)
    inpStation.dataset.stopId = '';
    clearTimeout(acTimer);
    if (v.trim().length < 3){ clearAutocomplete(); return; }
    // debounce queries to avoid overloading backend; reset on every keypress
    acTimer = setTimeout(async () => {
      try{
        // Don't filter by modes in autocomplete - Entur geocoder has bugs with 
        // categories filtering + Norwegian characters (e.g., "Støren" returns wrong results)
        const cands = await searchStations({ text: v, limit: 5, fetchFn: window.fetch });
        showCandidates(cands);
      }catch(err){ clearAutocomplete(); }
    }, 250);
  });

  // keyboard navigation for autocomplete
  inpStation.addEventListener('keydown', (e) => {
    const hasAutocomplete = acList && acList.classList.contains('open');
    const items = hasAutocomplete ? Array.from(acList.children || []) : [];
    
    if (hasAutocomplete) {
      if (e.key === 'ArrowDown'){
        e.preventDefault(); highlighted = Math.min(items.length - 1, highlighted + 1);
        items.forEach(it => it.classList.remove('highlighted'));
        if (items[highlighted]){ items[highlighted].classList.add('highlighted'); items[highlighted].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'ArrowUp'){
        e.preventDefault(); highlighted = Math.max(0, highlighted - 1);
        items.forEach(it => it.classList.remove('highlighted'));
        if (items[highlighted]){ items[highlighted].classList.add('highlighted'); items[highlighted].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'Enter'){
        e.preventDefault();
        // If something is highlighted, select it; otherwise select first item
        const indexToSelect = highlighted >= 0 ? highlighted : 0;
        if (items.length > 0) {
          selectCandidateIndex(indexToSelect);
        }
        // Move focus to next field
        inpNum.focus();
      } else if (e.key === 'Escape'){
        clearAutocomplete();
      }
    } else if (e.key === 'Enter') {
      // No autocomplete open, just move to next field
      e.preventDefault();
      inpNum.focus();
    }
  });

  // hide autocomplete shortly after blur so clicks on list are handled
  // If blur happens with autocomplete open and no selection made, auto-select first item
  inpStation.addEventListener('blur', () => { 
    setTimeout(() => { 
      // If autocomplete is still open, auto-select first item before clearing
      if (acList && acList.classList.contains('open') && lastCandidates.length > 0) {
        selectCandidateIndex(0);
      }
      clearAutocomplete(); 
    }, 150); 
  });

  // small visual confirmation (toast) when applying settings
  const toast = document.createElement('div'); toast.className = 'options-toast'; panel.appendChild(toast);
  function showToast(msg){
    try{
      toast.textContent = msg || t('settingsApplied');
      toast.classList.add('visible');
      toast.style.opacity = '1';
      clearTimeout(showToast._t);
      showToast._t = setTimeout(()=>{
        toast.style.opacity = '0';
        // hide after transition
        setTimeout(()=>{ toast.classList.remove('visible'); }, 300);
      }, 1400);
    }catch(e){/*ignore*/}
  }

  // apply on checkbox toggles but debounce rapid toggles to avoid frequent fetches
  let modesDebounceTimer = null;
  modesWrap.addEventListener('change', (e)=>{
    if (e.target && e.target.type === 'checkbox'){
      clearTimeout(modesDebounceTimer);
      modesDebounceTimer = setTimeout(()=>{ applyChanges(false); showToast(t('filtersUpdated')); }, 500);
    }
  });

  // apply immediately when text size selection changes
  selSize.addEventListener('change', ()=>{ applyChanges(false); showToast(t('textSizeUpdated')); });

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
