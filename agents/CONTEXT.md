Overall Context: Dependency-free departure board with Entur APIs, intelligent autocomplete, Norwegian support. Versioned service worker with 5-second countdown update notification, complete asset caching. Options panel with change detection, transport modes, multilingual (12 languages including Polish), auto-select on input focus. PR preview deployments using orphan previews branch (main at root, PRs in /pr-N/ subfolders).

Current Goal: Initialize previews branch and test PR preview workflow, then implement dark/light mode.

Last 3 Changes:
- agents/worklogs/2026-02-19-16-40-pr-preview-fix.md
- agents/worklogs/2026-02-19-16-31-pr-preview-deployment.md
- agents/worklogs/2026-02-18-20-11-update-notification-fix.md

Next Steps:
- Run ./scripts/init-previews-branch.sh and configure GitHub Pages
- Test PR preview workflow with actual PR
