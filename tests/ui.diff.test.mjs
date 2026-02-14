import assert from 'assert/strict';
import { computeDiff } from '../src/ui/ui.js';

console.log('Running ui.diff.test.mjs');

const oldKeys = ['A::t1','B::t2','C::t3'];
const newKeys = ['B::t2','D::t4','A::t1'];
const diff = computeDiff(oldKeys,newKeys);

assert.deepEqual(diff.toAdd, ['D::t4']);
assert.deepEqual(diff.toRemove, ['C::t3']);
assert.deepEqual(diff.newOrder, newKeys);

console.log('ui.diff.test.mjs OK');
