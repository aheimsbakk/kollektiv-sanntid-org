import { DEFAULTS } from './config.js';
import { getDemoData } from './data-loader.js';
import { formatCountdown, isoToEpochMs } from './time.js';
import { createBoardElements, clearList, findKey } from './ui/ui.js';
import { createDepartureNode } from './ui/departure.js';

const ROOT = document.getElementById('app');

function renderDepartures(listEl, items){
  clearList(listEl);
  items.forEach(it => {
    const node = createDepartureNode(it);
    // replace time text with formatted countdown
    const epoch = isoToEpochMs(it.expectedDepartureISO);
    node.time.textContent = formatCountdown(epoch);
    listEl.appendChild(node.container);
  });
}

async function init(){
  const board = createBoardElements(DEFAULTS.STATION_NAME);
  ROOT.appendChild(board.el);
  const data = getDemoData();
  renderDepartures(board.list, data);
  // simple per-second timer to update countdowns
  setInterval(()=>{
    const children = Array.from(board.list.children);
    children.forEach((child, idx)=>{
      const item = data[idx];
      if(!item) return;
      const timeEl = child.querySelector('.departure-time');
      const epoch = isoToEpochMs(item.expectedDepartureISO);
      if(timeEl) timeEl.textContent = formatCountdown(epoch);
    });
  },1000);
}

document.addEventListener('DOMContentLoaded', init);
