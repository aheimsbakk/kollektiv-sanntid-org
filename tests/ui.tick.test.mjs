import assert from 'assert/strict';
import { formatCountdown } from '../src/time.js';
import { createDepartureNode, updateDepartureCountdown } from '../src/ui/departure.js';
// provide a minimal DOM shim for Node test environment
if (typeof document === 'undefined'){
  global.document = {
    createElement: (tag)=>{
      const el = { tag, style:{}, dataset:{}, children:[], set textContent(v){ this._text = v }, get textContent(){ return this._text }, append(...n){ this.children.push(...n) } };
      return el;
    }
  };
}

console.log('Running ui.tick.test.mjs');

// Create a fake node backing object similar to createDepartureNode return
const now = Date.now();
const epoch = now + 75_000; // 75 seconds in future
const item = { destination: 'Test', expectedDepartureISO: new Date(epoch).toISOString(), situations: [] };
const node = createDepartureNode(item);

// initial update
updateDepartureCountdown(node, now, formatCountdown);
assert(node.time && node.time.textContent, 'time text should be set after update');
const first = node.time.textContent;

// after 1 second should decrement
updateDepartureCountdown(node, now + 1000, formatCountdown);
const second = node.time.textContent;
assert(first !== second, 'time should change between ticks');

// when epoch is in the past show Now
updateDepartureCountdown(node, epoch + 1000, formatCountdown);
assert(node.time.textContent === 'Now', 'time should be Now when target in past');

console.log('ui.tick.test.mjs OK');
