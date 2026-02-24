---
when: 2026-02-24T14:37:18Z
why: sync documentation with actual project state after agentic workflow was introduced
what: update BLUEPRINT.md and CONTEXT.md to reflect current codebase and multi-agent setup
model: github-copilot/claude-sonnet-4.6
tags: [docs, blueprint, context, agentic, worklogs, bump-version]
---

Rewrote BLUEPRINT.md to match the current implementation: corrected file tree (added `i18n.js`, `sw.js`, `manifest.webmanifest`, `icons/`, and all `src/ui/` components), updated all sections to reflect live features (PWA, themes, i18n, share URL, favorites, platform symbol rules, realtime indicators, cancellations), and removed references to deleted demo/offline fallback files. Fixed worklog and CONTEXT.md paths from `agents/worklogs/` to `docs/worklogs/` throughout, reflecting the move to the agentic multi-agent workflow (AGENTS.md, Mode A/B). Fixed `package.json` version from `0.1.0` to `1.30.2` and updated `scripts/bump-version.sh` to also bump `package.json`, replace GNU-only `grep -P` with portable `sed`, and handle macOS vs Linux `sed -i` differences. Bumped to version 1.30.3.
