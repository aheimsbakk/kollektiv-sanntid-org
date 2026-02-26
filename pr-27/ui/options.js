// Options panel UI: slide-in from right with controls to update DEFAULTS
import { searchStations } from '../entur.js';
import { t, setLanguage, getLanguage, getLanguages } from '../i18n.js';
import { ALL_TRANSPORT_MODES, TRANSPORT_MODE_EMOJIS } from '../config.js';

export function createOptionsPanel(defaults, onApply, onLanguageChange, onSave){
  const panel = document.createElement('aside'); panel.className = 'options-panel';
  // Start with inert to remove from tab order when closed
  panel.setAttribute('inert', '');
  const title = document.createElement('h3'); title.textContent = 'Kollektiv.Sanntid.org';
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
    if(!mode) return TRANSPORT_MODE_EMOJIS.default;
    const m = String(mode).toLowerCase();
    if(m.includes('bus')) return TRANSPORT_MODE_EMOJIS.bus;
    if(m.includes('tram') || m.includes('trikk')) return TRANSPORT_MODE_EMOJIS.tram;
    if(m.includes('metro') || m.includes('t-bane') || m.includes('tbane')) return TRANSPORT_MODE_EMOJIS.metro;
    if(m.includes('rail') || m.includes('train') || m.includes('tog')) return TRANSPORT_MODE_EMOJIS.rail;
    if(m.includes('water') || m.includes('ferry') || m.includes('ferje') || m.includes('boat')) return TRANSPORT_MODE_EMOJIS.water;
    if(m.includes('coach')) return TRANSPORT_MODE_EMOJIS.coach;
    return TRANSPORT_MODE_EMOJIS.default;
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
    // Title is not translated - it's the app name
    lblStation.textContent = t('stationName');
    lblNum.textContent = t('numberOfDepartures');
    lblInt.textContent = t('fetchInterval');
    lblSize.textContent = t('textSize');
    lblModes.textContent = t('transportModes');
    lblLang.textContent = t('switchLanguage');
    btnSave.textContent = t('save');
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
  const btnSave = document.createElement('button'); btnSave.type='button'; btnSave.textContent = t('save');
  const btnClose = document.createElement('button'); btnClose.type='button'; btnClose.textContent = t('close');
  actions.append(btnClose, btnSave);

  panel.append(rowStation, rowNum, rowInt, rowSize, rowModes, rowLang, actions);

  // Track initial values to detect changes
  let initialValues = {
    STATION_NAME: '',
    STOP_ID: null,
    NUM_DEPARTURES: 0,
    FETCH_INTERVAL: 0,
    TRANSPORT_MODES: [],
    TEXT_SIZE: ''
  };

  // apply changes immediately to DEFAULTS and trigger refresh
  function applyChanges(){
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
      STOP_ID: inpStation.dataset.stopId || null,
      NUM_DEPARTURES: numDepartures,
      FETCH_INTERVAL: fetchInterval,
      TRANSPORT_MODES: chosen.length ? chosen : ALL_TRANSPORT_MODES,
      TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large')
    };
    
    // Check if anything actually changed
    const hasChanged = 
      newOpts.STATION_NAME !== initialValues.STATION_NAME ||
      newOpts.STOP_ID !== initialValues.STOP_ID ||
      newOpts.NUM_DEPARTURES !== initialValues.NUM_DEPARTURES ||
      newOpts.FETCH_INTERVAL !== initialValues.FETCH_INTERVAL ||
      newOpts.TEXT_SIZE !== initialValues.TEXT_SIZE ||
      JSON.stringify(newOpts.TRANSPORT_MODES.sort()) !== JSON.stringify(initialValues.TRANSPORT_MODES.sort());
    
    if (hasChanged) {
      try{ onApply && onApply(newOpts); }catch(e){ console.warn('onApply failed', e); }
      // persist settings immediately
      try{ localStorage.setItem('departure:settings', JSON.stringify(newOpts)); }catch(e){}
      // Update initial values to the new values
      initialValues = {
        STATION_NAME: newOpts.STATION_NAME,
        STOP_ID: newOpts.STOP_ID,
        NUM_DEPARTURES: newOpts.NUM_DEPARTURES,
        FETCH_INTERVAL: newOpts.FETCH_INTERVAL,
        TRANSPORT_MODES: newOpts.TRANSPORT_MODES.slice(),
        TEXT_SIZE: newOpts.TEXT_SIZE
      };
    }
  }
  
  // Save current station + modes to favorites dropdown (only triggered by Save button)
  function saveToFavorites(){
    // Apply any pending changes first
    applyChanges();
    
    // Call the onSave callback if provided
    if (onSave && typeof onSave === 'function') {
      try {
        onSave();
        showToast(t('savedToFavorites'));
      } catch(e) {
        console.warn('onSave failed', e);
      }
    }
    
    closePanel();
  }

  btnClose.addEventListener('click', ()=> closePanel());
  btnSave.addEventListener('click', ()=> saveToFavorites());

  // Enter key navigation: station -> departures -> interval -> text size -> Save
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
      applyChanges();
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
      applyChanges();
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

  // Pre-fill and select station name on focus for easy editing
  inpStation.addEventListener('focus', () => {
    // Clear lastQuery so typing triggers new search
    lastQuery = '';
    // Clear any stale autocomplete
    clearAutocomplete();
    
    // Always pre-fill with current station name if available
    // This provides visual context of what station is currently selected
    if (defaults.STATION_NAME && !inpStation.value) {
      inpStation.value = defaults.STATION_NAME;
      inpStation.dataset.stopId = defaults.STOP_ID || '';
    }
    
    // Select text so user can immediately start typing to replace
    inpStation.select();
  });

  inpNum.addEventListener('focus', () => {
    inpNum.select();
  });

  inpInt.addEventListener('focus', () => {
    inpInt.select();
  });

  // Function to update panel fields with current defaults (useful when station changes while panel is open)
  let updatingFields = false;
  function updateFields() {
    updatingFields = true;
    // Update input fields with current defaults
    inpStation.value = defaults.STATION_NAME || '';
    inpStation.dataset.stopId = defaults.STOP_ID || '';
    inpNum.value = defaults.NUM_DEPARTURES || 2;
    inpInt.value = defaults.FETCH_INTERVAL || 60;
    selSize.value = defaults.TEXT_SIZE || 'medium';
    
    // Update transport mode checkboxes
    const checkboxes = modesWrap.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(cb => {
      cb.checked = (defaults.TRANSPORT_MODES || []).includes(cb.value);
    });
    
    // Reset lastQuery to ensure autocomplete works on first keystroke
    // This fixes the bug where autocomplete doesn't work after opening with default station
    lastQuery = '';
    
    // Clear any stale autocomplete state from previous sessions
    // This prevents auto-selecting from old candidate lists when user types new queries
    clearAutocomplete();
    
    // Update initial values to match current state
    const chosen = Array.from(modesWrap.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
    initialValues = {
      STATION_NAME: inpStation.value || defaults.STATION_NAME,
      STOP_ID: inpStation.dataset.stopId || null,
      NUM_DEPARTURES: Number(inpNum.value) || defaults.NUM_DEPARTURES,
      FETCH_INTERVAL: Number(inpInt.value) || defaults.FETCH_INTERVAL,
      TRANSPORT_MODES: chosen.slice(),
      TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large')
    };
    updatingFields = false;
  }

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
    
    // Check all transport mode checkboxes when selecting a new station
    const checkboxes = modesWrap.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(cb => { cb.checked = true; });
    
    // Apply changes immediately
    applyChanges();
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
    // Ignore input events triggered by programmatic updates
    if (updatingFields) return;
    
    const v = String(inpStation.value || '');
    
    // Special case: if lastQuery is empty and input value is long (>= 3 chars),
    // user probably just focused (lastQuery cleared) but input still has old value.
    // This happens when select() doesn't work properly on mobile.
    // Clear the input to start fresh.
    if (lastQuery === '' && v.trim().length >= 3 && !inpStation.dataset.stopId) {
      inpStation.value = '';
      lastQuery = '';
      clearAutocomplete();
      return;
    }
    
    if (v === lastQuery) return;
    lastQuery = v;
    // Clear stored stopId when user manually types (not selecting from autocomplete)
    inpStation.dataset.stopId = '';
    clearTimeout(acTimer);
    if (v.trim().length < 3){ clearAutocomplete(); return; }
    
    // Clear old candidates immediately when starting a new search
    // This prevents auto-selecting stale results if user blurs before new results arrive
    lastCandidates = [];
    
    // debounce queries to avoid overloading backend; reset on every keypress
    acTimer = setTimeout(async () => {
      const searchQuery = v; // Capture query for this specific search
      try{
        // Don't filter by modes in autocomplete - Entur geocoder has bugs with 
        // categories filtering + Norwegian characters (e.g., "Støren" returns wrong results)
        const cands = await searchStations({ text: searchQuery, limit: 5, fetchFn: window.fetch });
        
        // Only show results if the input hasn't changed since this search started
        if (inpStation.value === searchQuery) {
          showCandidates(cands);
        }
      }catch(err){ 
        clearAutocomplete(); 
      }
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
      // But only if user actually typed something (stopId is empty = user was typing)
      if (acList && acList.classList.contains('open') && lastCandidates.length > 0 && !inpStation.dataset.stopId) {
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

  // Apply immediately on checkbox toggles (debounced)
  let modesDebounceTimer = null;
  modesWrap.addEventListener('change', (e)=>{
    if (e.target && e.target.type === 'checkbox'){
      clearTimeout(modesDebounceTimer);
      modesDebounceTimer = setTimeout(()=>{ applyChanges(); showToast(t('filtersUpdated')); }, 500);
    }
  });

  // Apply immediately when text size selection changes
  selSize.addEventListener('change', ()=>{ applyChanges(); showToast(t('textSizeUpdated')); });

  function _escClose(e){ if (e.key === 'Escape' || e.key === 'Esc') closePanel(); }

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

  /** Open the panel: shift page layout, restore from inert, trap focus, attach ESC handler. */
  function openPanel(){
    document.body.classList.add('options-open');
    panel.removeAttribute('inert');
    // save previously focused element so we can restore it on close
    openPanel._prevFocus = document.activeElement;
    // sync input fields with current runtime defaults before showing
    updateFields();
    panel.classList.add('open');
    // move focus to first interactive element
    const first = panel.querySelector('input, button, [tabindex]');
    if(first) first.focus();
    document.addEventListener('keydown', _trap);
    document.addEventListener('keydown', _escClose);
  }

  /** Close the panel: restore layout, make inert, release focus trap. */
  function closePanel(){
    document.body.classList.remove('options-open');
    panel.setAttribute('inert', '');
    panel.classList.remove('open');
    try{ if(openPanel._prevFocus && typeof openPanel._prevFocus.focus === 'function') openPanel._prevFocus.focus(); }catch(e){}
    document.removeEventListener('keydown', _trap);
    document.removeEventListener('keydown', _escClose);
  }

  return { panel, open: openPanel, close: closePanel, updateFields };
}
