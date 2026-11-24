---
topic: 'Departure time cell: static clock plus live countdown span'
importance: medium
category: decision
tags: [departures, countdown, render, time-cell]
created: 2026-11-24T17:48:41Z
model: kompis/qwen3.8-flash-next-iq3_s
---

The time cell is composed from `DEPARTURE_TIME_TEMPLATE` (`{time} · {countdown}`);
only the `.departure-countdown` span is rewritten each second by `tickCountdowns`
and `updateDepartureCountdown`. Any change to the cell DOM must keep the span
selector in both tick paths and `tests/ui.tick.test.mjs` in sync. Template
suffix text is rendered in a span, not a text node, because the test DOM shim
has no `createTextNode`.
