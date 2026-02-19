---
when: 2026-02-19T16:31:08Z
why: Enable automatic PR preview deployments using GitHub Environments
what: Add PR preview workflows with environment-based deployment
model: github-copilot/claude-sonnet-4.5
tags: [github-actions, pr-preview, deployment, ci-cd]
---

Implemented PR preview deployment system using GitHub Environments. Created `.github/workflows/pr-preview.yml` to deploy each PR to a unique environment (pr-preview-N) and `.github/workflows/pr-preview-cleanup.yml` to automatically remove environments when PRs are closed. Version bumped to 1.10.0.
