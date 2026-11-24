---
topic: 'Test runner discipline'
importance: high
category: warning
tags: [tests, test-runner, registry, global-stubs]
created: 2026-11-24T16:22:17Z
model: kompis/qwen3.8-flash-next-iq3_s
---

`tests/run.mjs` holds an explicit `suites` list and awaits one dynamic
`import()` per suite; a test file that is not listed never runs. Sequential
loading is required because suites replace globals (`document`,
`localStorage`, `setTimeout`, `navigator`) — static imports interleave
top-level awaits and let one suite resume after another replaced its stubs.
Never call `process.exit()` inside a suite: it kills the process and silently
skips every remaining suite. Set `process.exitCode = 1` instead.
