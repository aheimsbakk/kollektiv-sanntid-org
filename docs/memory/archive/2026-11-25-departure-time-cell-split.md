---
topic: 'Departure time cell: live countdown span, static clock on either side'
importance: medium
category: decision
tags: [departures, countdown, render, time-cell]
created: 2026-11-25T17:08:04Z
model: kompis/qwen3.8-flash-next-iq3_s
---

The time cell is composed from `DEPARTURE_TIME_TEMPLATE` (default
`{countdown} → {time}`); only the `.departure-countdown` span is rewritten each
second by `tickCountdowns` and `updateDepartureCountdown`. The static template
text may sit before or after the span; `createDepartureNode` replaces `{time}`
on both sides. Any change to the cell DOM must keep the span selector in both
tick paths and `tests/ui.tick.test.mjs` in sync. Suffix text is rendered in a
span, not a text node, because the test DOM shim has no `createTextNode`.
