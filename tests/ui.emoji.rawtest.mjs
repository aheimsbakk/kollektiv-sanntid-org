import { createDepartureNode } from '../src/ui/departure.js';

function assertEqual(a,b,msg){ if(a!==b) throw new Error(msg || `assertEqual failed: ${a} !== ${b}`); }

// nested raw where transport token is in a nested key
const nested1 = {
  destination: 'Nested A',
  expectedDepartureISO: new Date(Date.now()+60000).toISOString(),
  raw: { service: { info: { type: 'bus' } } }
};
const n1 = createDepartureNode(nested1);
assertEqual(n1.container.querySelector('.departure-destination').textContent.trim().startsWith('🚌'), true, 'nested bus detection');

// nested raw where token appears in key name
const nested2 = {
  destination: 'Nested B',
  expectedDepartureISO: new Date(Date.now()+120000).toISOString(),
  raw: { transportMode_bus: { code: 'XYZ' } }
};
const n2 = createDepartureNode(nested2);
assertEqual(n2.container.querySelector('.departure-destination').textContent.trim().startsWith('🚌'), true, 'key-detect bus');

console.log('ui.emoji.rawtest passed');
