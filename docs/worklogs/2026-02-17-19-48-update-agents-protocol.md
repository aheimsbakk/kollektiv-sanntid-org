---
when: 2026-02-17T19:48:24Z
why: Update protocol to enforce version bumping on every commit
what: Update AGENTS.md workflow to include mandatory version bumping
model: github-copilot/claude-sonnet-4.5
tags: [docs, protocol, versioning]
---

Updated AGENTS.md workflow section to include version bumping as step 4 before worklog creation. Enhanced versioning section to clarify that every commit must bump version in src/sw.js for service worker cache invalidation. Version bumped to 1.0.3.
