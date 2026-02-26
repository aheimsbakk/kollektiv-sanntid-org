---
when: 2026-02-26T19:32:29Z
why: Service worker was missing icon assets from its cache list, causing offline 404s; rsync deploy was silently skipping same-size file edits (e.g. version bumps)
what: Add icon assets to sw.js ASSETS list; add --checksum to rsync in CI workflows
model: github-copilot/claude-sonnet-4.6
tags: [fix, sw, pwa, ci, offline, icons]
---

Added `./icons/favicon.svg`, `./icons/icon-192.svg`, and `./icons/icon-512.svg` to the `ASSETS` array in `src/sw.js` — these are referenced by `index.html` and `manifest.webmanifest` but were absent from the precache list, causing 404s when offline. Added `--checksum` flag to the `rsync` commands in `.github/workflows/static.yml` and `.github/workflows/pr-preview.yml` to force content-based comparison; without it, same-length edits (like version string bumps) were silently skipped by rsync since all Git checkout files share the same mtime. Version bumped 1.30.6 → 1.30.7.
