---
when: 2026-02-20T18:28:13Z
why: GitHub Actions deployment workflow has bug causing version mismatch
what: manually deployed version 1.27.2 to gh-pages branch
model: github-copilot/claude-sonnet-4.5
tags: [deployment, gh-pages, bug-investigation, version]
---

Investigated why gh-pages showed version 1.27.1 instead of 1.27.2 after PR #11 merge. Found that the GitHub Actions workflow at `.github/workflows/static.yml` line 50 has a bug: `git pull --rebase --autostash` brings back old file versions from gh-pages, overwriting freshly copied files from main. Only git-tracked changes from the commit make it through the rebase. Manually deployed version 1.27.2 to gh-pages by copying all files from src/ and pushing directly. Files config.js and sw.js now both show version 1.27.2 in gh-pages branch. Note: Live site may show cached version 1.27.1 due to GitHub Pages CDN caching, but raw GitHub content confirms 1.27.2 is deployed.
