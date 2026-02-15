import { createDepartureNode } from '../src/ui/departure.js';

function assertEqual(a,b,msg){ if(a!==b) throw new Error(msg || `assertEqual failed: ${a} !== ${b}`); }

// bus -> 🚌
const busItem = { destination: 'Stop A', expectedDepartureISO: new Date(Date.now()+60000).toISOString(), transportMode: 'bus' };
const node1 = createDepartureNode(busItem);
assertEqual(node1.container.querySelector('.departure-destination').textContent.trim().startsWith('🚌'), true, 'bus emoji');

// tram -> 🚋 (we chose option 2)
const tramItem = { destination: 'Stop B', expectedDepartureISO: new Date(Date.now()+120000).toISOString(), transportMode: 'tram' };
const node2 = createDepartureNode(tramItem);
assertEqual(node2.container.querySelector('.departure-destination').textContent.trim().startsWith('🚋'), true, 'tram emoji');

// missing mode -> fallback 🚆
const emptyItem = { destination: 'Stop C', expectedDepartureISO: new Date(Date.now()+180000).toISOString() };
const node3 = createDepartureNode(emptyItem);
assertEqual(node3.container.querySelector('.departure-destination').textContent.trim().startsWith('🚆'), true, 'fallback emoji');

console.log('ui.emoji tests passed');
