---
when: 2026-02-19T16:48:05Z
why: Fix PR preview deployment to use gh-pages branch with sub-folders
what: Redesign workflows for sub-folder based PR previews
model: github-copilot/claude-sonnet-4.5
tags: [github-actions, pr-preview, deployment, ci-cd, fix]
---

Redesigned PR preview deployment to use gh-pages branch with sub-folder structure (pr-N/ folders) instead of separate environments. Updated all three workflows: main deployment to gh-pages root, PR preview to sub-folders, and cleanup to remove folders. Version bumped to 1.10.1.
