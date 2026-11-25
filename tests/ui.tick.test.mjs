import assert from 'assert/strict';
import { formatCountdown, formatClock } from '../src/time.js';
import { DEPARTURE_TIME_TEMPLATE } from '../src/config.js';
import { createDepartureNode, updateDepartureCountdown } from '../src/ui/departure.js';
// provide a minimal DOM shim for Node test environment
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => {
      const el = {
        tag,
        style: {},
        dataset: {},
        children: [],
        set textContent(v) {
          this._text = v;
        },
        get textContent() {
          return this._text;
        },
        append(...n) {
          this.children.push(...n);
        },
      };
      return el;
    },
  };
}

console.log('Running ui.tick.test.mjs');

// Create a fake node backing object similar to createDepartureNode return
const now = Date.now();
const epoch = now + 75_000; // 75 seconds in future
const item = {
  destination: 'Test',
  expectedDepartureISO: new Date(epoch).toISOString(),
  situations: [],
};
const node = createDepartureNode(item);

// The time cell holds static template text around the live countdown span.
// With the default template the clock sits after the arrow, in a trailing span.
const clock = formatClock(epoch);
const [prefix, suffix = ''] = DEPARTURE_TIME_TEMPLATE.split('{countdown}');
assert.equal(
  node.time.textContent,
  prefix.replace('{time}', clock),
  'time cell should hold the static leading template text'
);
const tailSpan = node.time.children.find((el) => el !== node.countdown);
assert(tailSpan, 'trailing static span should exist');
assert.equal(
  tailSpan.textContent,
  suffix.replace('{time}', clock),
  'clock text should sit in the trailing span'
);

// The countdown lives in its own span and updates live.
assert(node.countdown, 'countdown span should exist');
updateDepartureCountdown(node, now, formatCountdown);
assert(node.countdown.textContent, 'countdown text should be set after update');
const first = node.countdown.textContent;

// after 1 second should decrement
updateDepartureCountdown(node, now + 1000, formatCountdown);
assert(node.countdown.textContent !== first, 'countdown should change between ticks');

// ticks must not touch the static template text on either side of the span
assert.equal(node.time.textContent, prefix, 'leading template text must survive ticks');
assert.equal(
  tailSpan.textContent,
  suffix.replace('{time}', clock),
  'clock text must survive ticks'
);

// when epoch is in the past show Now
updateDepartureCountdown(node, epoch + 1000, formatCountdown);
assert.equal(node.countdown.textContent, 'Now', 'countdown should be Now when target in past');

// An invalid departure time renders a dash and creates no countdown span.
const broken = createDepartureNode({ destination: 'Broken', situations: [] });
assert.equal(broken.time.textContent, '—', 'invalid time should render a dash');
assert(!broken.countdown, 'invalid time should not create a countdown span');

console.log('ui.tick.test.mjs OK');
