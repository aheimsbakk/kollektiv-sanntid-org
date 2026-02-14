import { DEFAULTS } from './config.js';
import { getDemoData } from './data-loader.js';
import { formatCountdown, isoToEpochMs } from './time.js';
import { createBoardElements, clearList, findKey } from './ui/ui.js';
import { createDepartureNode, updateDepartureCountdown } from './ui/departure.js';
import { fetchDepartures, lookupStopId } from './entur.js';

const ROOT = document.getElementById('app');

function renderDepartures(listEl, items){
  clearList(listEl);
  items.forEach(it => {
    const node = createDepartureNode(it);
    // initial countdown
    updateDepartureCountdown(node, Date.now(), formatCountdown);
    listEl.appendChild(node.container);
  });
}

async function init(){
  const board = createBoardElements(DEFAULTS.STATION_NAME);
  ROOT.appendChild(board.el);
  // Try live data first, fall back to demo
  let data = [];
  try{
    const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
    if(stopId && DEFAULTS.API_URL){
      data = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
    }
  }catch(e){
    console.warn('Live fetch failed, falling back to demo', e && e.message ? e.message : e);
  }
  if(!data || !data.length){
    data = await getDemoData();
  }
  renderDepartures(board.list, data);
  // if any situation exists show single banner
  const anySitu = data.find(d=>Array.isArray(d.situations) && d.situations.length);
  if(anySitu && board.banner){ board.banner.textContent = anySitu.situations.join('; '); board.banner.style.display = 'block'; board.el.insertBefore(board.banner, board.list); }

  // refresh logic: clear cache and refetch every FETCH_INTERVAL seconds
  setInterval(async ()=>{
    try{
      // clear entur cache to force network refetch
      if(globalThis._enturCache) globalThis._enturCache.clear();
      const stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, clientName: DEFAULTS.CLIENT_NAME });
      let fresh = [];
      if(stopId){
        fresh = await fetchDepartures({ stopId, numDepartures: DEFAULTS.NUM_DEPARTURES, modes: DEFAULTS.TRANSPORT_MODES, apiUrl: DEFAULTS.API_URL, clientName: DEFAULTS.CLIENT_NAME });
      }
      if(!fresh || !fresh.length){
        fresh = await getDemoData();
      }
      // re-render for now; later we can diff and patch
      renderDepartures(board.list, fresh);
      data = fresh;
    }catch(err){
      console.warn('Refresh failed', err);
    }
  }, DEFAULTS.FETCH_INTERVAL * 1000);
}

document.addEventListener('DOMContentLoaded', init);
