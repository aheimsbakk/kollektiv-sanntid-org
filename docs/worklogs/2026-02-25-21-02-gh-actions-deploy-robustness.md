---
when: 2026-02-25T21:02:30Z
why: GitHub Actions deploy workflows intermittently failed due to staged changes being lost during git rebase
what: Fix deploy race condition and add orphaned PR preview garbage collection
model: github-copilot/claude-sonnet-4.6
tags: [ci, github-actions, gh-pages, deploy, bugfix]
---

Fixed a race condition in all three deploy workflows (`static.yml`, `pr-preview.yml`, `pr-preview-cleanup.yml`) where `git add` ran before `git pull --rebase`, causing staged changes to be discarded by the rebase. Fix moves the pull to before staging in all three files and removes the fragile push-retry fallback. Added a new `pr-preview-gc.yml` workflow that runs weekly (Sundays 00:00 UTC) and on-demand to remove orphaned `pr-*/` folders on gh-pages whose PRs are no longer open. Bumped to v1.30.5.
