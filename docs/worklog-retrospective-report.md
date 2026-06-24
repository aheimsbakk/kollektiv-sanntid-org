# Worklog Retrospective Report

**Generated:** 2026-04-02
**Scope:** 304 worklogs spanning 2026-02-14 to 2026-04-02
**Project:** Kollektivsanntid — Real-time Transit Departure Board (PWA)

---

## 1. Where Time Was Spent — Top Categories by Worklog Count

| Category                      | Worklogs | % of Total | Notes                                                    |
| ----------------------------- | -------- | ---------- | -------------------------------------------------------- |
| **UI / CSS / Style / Layout** | ~110     | 36%        | Visual polish, spacing, responsive, dark/light mode      |
| **Bugfixes**                  | 90+      | 30%        | Post-feature corrections, race conditions, cross-browser |
| **Scroll-to-load-more**       | 17+      | 6%         | Single feature, 3 days, 12 snap-back iterations alone    |
| **Service Worker / Cache**    | 20       | 7%         | Update flow, cache invalidation, stale assets            |
| **Autocomplete / Geocoder**   | 18       | 6%         | Norwegian chars, ranking, debouncing, stopId bugs        |
| **i18n / Translations**       | 11       | 4%         | 12 languages, live switching, situation text i18n        |
| **OSM Map Button**            | 10       | 3%         | New feature + 9 follow-up coordinate/CSS fixes           |
| **Favorites / Heart**         | 11       | 4%         | Add, remove, mode-aware, default station, UX             |
| **Footer**                    | 11       | 4%         | Positioning, link, attribution, overlap fixes            |
| **Refactoring (SRP)**         | 7        | 2%         | Splitting monoliths into modules                         |
| **Docs / README**             | 22       | 7%         | Blueprint, README, ANALYZE.md, PROJECT_RULES             |

---

## 2. The Three Biggest Time Sinks — and Why

### 2.1 Scroll-to-Load-More (17+ worklogs, ~3 days)

This single feature consumed disproportionate effort. The initial implementation added pull-to-load-more with visual drag displacement and bounce-back animation. What followed was a cascade of mobile-specific issues:

- **12 iterations on snap-back/bounce animation alone** — rAF stalls on mobile compositor, CSS transition not firing due to batched style flushes, ghost clicks cancelling transitions mid-flight, Firefox dispatching stale rAF frames after `cancelAnimationFrame()`.
- **Final resolution: remove all drag displacement entirely.** After 12 attempts to make visual feedback work reliably across iOS Safari, Chrome Android, and Firefox mobile, the feature was simplified to silent threshold tracking with load-on-release only.

**Why it took so long:**

1. The initial design was too ambitious — visual drag displacement on mobile browsers is notoriously unreliable due to compositor thread differences.
2. Each fix introduced a new edge case on a different browser. iOS ghost clicks, Firefox rAF bugs, Chrome compositor stalls — each required platform-specific workarounds.
3. The approach was "fix forward" rather than stepping back to question the design. The eventual simplification (remove drag entirely) was the right call but came after 12 failed attempts.

### 2.2 Service Worker / Cache Invalidation (20 worklogs)

Persistent issues with the PWA update mechanism:

- Cache serving stale assets after version bumps
- `controllerchange` event firing before `clients.claim()` completed
- `ignoreSearch: true` silently defeating cache-bust query params
- `cache.addAll()` fetching through browser HTTP cache instead of network
- Race conditions between SW activation and page reload

**Why it took so long:**

1. Service worker lifecycle events are asynchronous and browser-dependent — the ordering of `install` → `activate` → `clients.claim()` → `controllerchange` varies across browsers.
2. The update flow was changed 4+ times (manual prompt → auto-reload → SW_ACTIVATED message → controllerchange → back to controllerchange with fallback).
3. Each "fix" addressed one symptom without fully understanding the event ordering, leading to regressions.

### 2.3 Cross-Browser Mobile CSS (Chrome address bar, Firefox touch, iOS ghost clicks)

Multiple worklogs dedicated to platform-specific rendering bugs:

- Chrome mobile address bar showing white flash (gradient can't be used as fallback paint color)
- Chrome compositor ignoring CSS custom properties on `<html>` for address-bar gap
- Firefox not propagating padding from nested flex children to scroll container
- Firefox mobile touch choppy due to per-frame `preventDefault` waiting
- iOS/Android ghost `mousedown` ~300ms after `touchend`

**Why it took so long:**

1. Each browser has unique rendering quirks for PWA/mobile that aren't documented in standard CSS references.
2. Fixes often required inline styles, forced reflows, or UA-specific workarounds — not clean CSS.
3. Testing required physical devices; emulators don't reproduce address-bar or compositor behavior.

---

## 3. Recurring Patterns That Wasted Time

### 3.1 "Fix Forward" Instead of "Simplify First"

Many features (scroll-more, SW update flow, OSM button) went through 5-12 iterations of incremental fixes before being simplified or partially reverted. The scroll-more drag displacement was eventually removed entirely — something that could have been decided after 2-3 failed attempts rather than 12.

### 3.2 Missing Assets in Service Worker Cache List

At least 6 worklogs exist solely to add newly created files to `sw.js ASSETS`. This is a mechanical step that was repeatedly forgotten after creating new modules (`footer.js`, `osm-button.js`, `i18n/*.js`, `css/*.css`).

### 3.3 Coordinate/State Propagation Gaps

The OSM button required 10 worklogs because GPS coordinates (`lat`/`lon`) weren't propagated through the full chain: geocoder → autocomplete → settings → favorites → share URL → reload. Each link in the chain was fixed independently rather than auditing the full data flow upfront.

### 3.4 CSS Positioning Iterations

Footer positioning alone took 11 worklogs (fixed, lower-left, overlap with board, Firefox-specific, padding-bottom on body vs .board vs .app-root). Many of these were trial-and-error rather than systematic layout planning.

### 3.5 Silent Catch Blocks

Recurring issue across multiple audits — empty `catch {}` blocks hiding runtime errors. Fixed in at least 3 separate worklogs (ANALYZE.md rounds) because new ones kept being introduced.

---

## 4. Recommendations for Future Projects

### 4.1 Prototype Cross-Browser Mobile Behavior Early

Before committing to a mobile interaction pattern (drag, bounce, pull-to-refresh), **prototype it in 1-2 hours across real iOS Safari, Chrome Android, and Firefox mobile.** If it doesn't work cleanly in all three, simplify the design immediately rather than iterating on browser-specific hacks.

**Action:** Add a "mobile feasibility check" step to the feature planning phase. If the feature involves touch gestures, visual drag feedback, or compositor-dependent animations, validate on real devices before implementation.

### 4.2 Automate Service Worker Asset Registration

The repeated "forgot to add to sw.js ASSETS" problem is a process failure. Create a build step or lint rule that:

- Scans `src/` for all `.js`, `.css`, `.html`, `.svg`, `.webmanifest` files
- Compares against `sw.js ASSETS` array
- Fails CI if any source file is missing

**Action:** Add a `scripts/validate-sw-assets.sh` script that diffs the filesystem against the ASSETS list and runs it as a pre-commit hook or CI check.

### 4.3 Audit Full Data Flow Before Feature Implementation

The OSM coordinate propagation issue (10 worklogs) could have been avoided by mapping the full data flow on paper before writing code:

```
geocoder → autocomplete.dataset → settings payload → DEFAULTS → localStorage → favorites → share URL → reload restore
```

**Action:** For any feature that touches multiple modules, draw a data-flow diagram and verify every link before implementation. This is especially critical for state that crosses module boundaries (settings, favorites, coordinates).

### 4.4 Establish a "Simplify Threshold"

Define a rule: **if a feature requires more than 3 fix-forward worklogs on the same subsystem, stop and reassess the design.** The scroll-more feature would have been simplified after iteration 3 instead of iteration 12.

**Action:** Add to project rules: "After 3 consecutive bugfix worklogs on the same feature, the next step must be a design review, not another fix."

### 4.5 Use CSS Transitions Over JS Animation for Mobile

The scroll-more saga proved that JS-driven `requestAnimationFrame` animations are unreliable on mobile due to compositor thread scheduling. CSS `transition` is more reliable but still had reflow issues.

**Action:** Default to CSS transitions/animations for any visual feedback on mobile. Only use JS animation when CSS cannot express the logic (e.g., physics-based springs). Even then, test on real devices first.

### 4.6 Centralize Shared Constants Immediately

The DRY violation (same transport mode list in 3 files) was flagged in ANALYZE.md and required a dedicated fix. Constants that appear in more than one file should be centralized on first occurrence.

**Action:** Enforce via code review: if a constant/string appears in 2+ files, extract to `config.js` or a shared utility immediately. Don't defer to "clean up later."

### 4.7 Reduce CSS Trial-and-Error with Systematic Layout

Footer and dropdown positioning went through many iterations because changes were made incrementally without a complete mental model of the layout context.

**Action:** Before writing CSS for positioned elements (fixed, absolute), document the stacking context, containing block, and scroll container in a comment. This forces explicit reasoning about which ancestor controls the positioning context.

### 4.8 Write Integration Tests for State Persistence

Settings, favorites, and coordinates crossing localStorage → reload → restore was a recurring source of bugs. Unit tests exist but don't cover the full reload cycle.

**Action:** Add at least one integration test that simulates: save settings → clear in-memory state → load settings → verify all fields restored. This catches propagation gaps that unit tests miss.

---

## 5. Summary

**~36% of all worklogs** were UI/CSS/style related — visual polish and cross-browser rendering consumed the most effort overall.

**The single most time-consuming feature** was scroll-to-load-more (17+ worklogs), primarily due to mobile compositor/browser incompatibilities that resisted incremental fixes.

**The most preventable time waste** was the "fix forward" pattern — continuing to patch a problematic design rather than simplifying it. The scroll-more drag displacement, SW update flow, and OSM coordinate chain all followed this pattern.

**The highest-ROI process improvement** would be automating SW asset registration and establishing a "simplify threshold" after 3 consecutive fix-forward worklogs on the same subsystem.
