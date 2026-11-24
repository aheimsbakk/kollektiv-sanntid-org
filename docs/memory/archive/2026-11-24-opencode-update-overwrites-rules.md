---
topic: 'opencode update.sh overwrites agent rules'
importance: high
category: warning
tags: [opencode, agents-md, upstream, policy]
created: 2026-11-24T16:22:17Z
model: kompis/qwen3.8-flash-next-iq3_s
---

`.opencode/update.sh` downloads `AGENTS.md`, `opencode.json`, and everything
under `.opencode/` from `github.com/aheimsbakk/agentic-opencode`, so it
overwrites local edits to those files. On 2026-11-24 this repo changed the
AGENTS.md CI/CD rule to allow `.github/workflows/`; running `update.sh` will
restore the upstream "No .github workflows" line. Re-apply local rule edits
after running the script.
