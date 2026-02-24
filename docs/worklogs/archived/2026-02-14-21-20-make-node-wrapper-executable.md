---
when: 2026-02-14T21:20:00Z
why: make node wrapper executable and add npm test script
what: changed mode of `node/node` to executable and added `test` script to package.json
model: github-copilot/gpt-5-mini
tags: [setup, tests]
---

Made `node/node` executable (`chmod +x node/node`) to provide a local launcher for the repo Node. Also added an `npm test` script to `package.json` that runs `node tests/run.mjs`.
