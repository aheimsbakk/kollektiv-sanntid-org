---
when: 2026-02-21T08:11:35Z
why: make GitHub link in footer configurable for forked repos
what: add GITHUB_URL to config.js for customizable footer link
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, config, footer, v1.30.1]
---

Made the GitHub repository link in the footer configurable by adding `GITHUB_URL` to `DEFAULTS` in `src/config.js`. Updated `src/ui/ui.js` to import and use `DEFAULTS.GITHUB_URL` with fallback to original URL. This allows users to easily customize the footer link when forking the repository. Version bumped to 1.30.1.
