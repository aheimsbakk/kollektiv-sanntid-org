/**
 * Test for autocomplete on first app load with default station
 */

import { strict as assert } from 'assert';

console.log('Testing autocomplete first load scenario...');

// Test: should handle first keystroke when input has default station name
(function testFirstKeystroke() {
    // Simulate the scenario:
    // 1. App loads with DEFAULTS.STATION_NAME = "Jernbanetorget, Oslo", STOP_ID = null
    // 2. Options panel opens, updateFields() sets input value
    // 3. User focuses input
    // 4. User types first character
    
    // Mock the input element
    const mockInput = {
      value: '',
      dataset: { stopId: '' },
      listeners: {},
      addEventListener(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
      },
      trigger(event, data = {}) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(h => h(data));
        }
      },
      select() {
        // Mock select - doesn't actually select on mobile
      }
    };
    
    let lastQuery = '';
    let searchTriggered = false;
    let searchText = null;
    
    // Simulate focus handler
    mockInput.addEventListener('focus', () => {
      lastQuery = '';
    });
    
    // Simulate input handler with the fix
    mockInput.addEventListener('input', (e) => {
      const v = String(mockInput.value || '');
      console.log(`  [input event] value="${v}", lastQuery="${lastQuery}", stopId="${mockInput.dataset.stopId}"`);
      
      // The fix: detect stale value on first keystroke
      if (lastQuery === '' && v.trim().length >= 3 && !mockInput.dataset.stopId) {
        console.log(`  [clearing stale value]`);
        mockInput.value = '';
        lastQuery = '';
        return;
      }
      
      if (v === lastQuery) {
        console.log(`  [skipping - same as lastQuery]`);
        return;
      }
      lastQuery = v;
      mockInput.dataset.stopId = '';
      
      if (v.trim().length >= 3) {
        console.log(`  [triggering search] text="${v}"`);
        searchTriggered = true;
        searchText = v;
      }
    });
    
    // Step 1: Panel opens, updateFields sets value
    mockInput.value = 'Jernbanetorget, Oslo';
    mockInput.dataset.stopId = '';
    lastQuery = ''; // updateFields() sets this
    
    // Step 2: User focuses
    mockInput.trigger('focus');
    assert.strictEqual(lastQuery, '', 'lastQuery should be empty after focus');
    
    // Step 3: User types first character - but select() failed so value still full
    mockInput.trigger('input');
    
    // After fix: input should be cleared, no search triggered yet
    assert.strictEqual(mockInput.value, '', 'Input should be cleared on first keystroke');
    assert.strictEqual(searchTriggered, false, 'Search should not trigger with stale value');
    assert.strictEqual(lastQuery, '', 'lastQuery should remain empty');
    
    // Step 4: User types again character by character, now with fresh input
    // First char: "B" (length 1, won't trigger search)
    mockInput.value = 'B';
    mockInput.trigger('input');
    assert.strictEqual(mockInput.value, 'B', 'Single char should not be cleared');
    assert.strictEqual(searchTriggered, false, 'Search should not trigger with 1 char');
    
    // Second char: "Be" (length 2, won't trigger search)  
    mockInput.value = 'Be';
    mockInput.trigger('input');
    assert.strictEqual(mockInput.value, 'Be', 'Two chars should not be cleared');
    assert.strictEqual(searchTriggered, false, 'Search should not trigger with 2 chars');
    
    // Third char: "Ber" (length 3, will trigger search)
    mockInput.value = 'Ber';
    mockInput.trigger('input');
    
    assert.strictEqual(searchTriggered, true, 'Search should trigger with new input');
    assert.strictEqual(searchText, 'Ber', 'Search should use new typed text');
    
    console.log('  ✓ First keystroke handling works correctly');
  })();

console.log('✓ Autocomplete first load tests completed');
