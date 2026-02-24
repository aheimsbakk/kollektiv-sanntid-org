---
when: 2026-02-16T21:34:50Z
why: Improve autocomplete filtering and realtime departure data quality
what: Add geocoder categories filtering and full realtime fields to GraphQL query
model: github-copilot/claude-sonnet-4.5
tags: [entur, geocoder, realtime, autocomplete]
---

Refined station autocomplete to use `layers=venue` and `categories` parameters per docs/geocoder.md, mapping transport modes to proper geocoder categories (bus→onstreetBus,busStation,coachStation, etc). Updated GraphQL query to request all realtime fields (realtime, aimedDepartureTime, actualDepartureTime, cancellation, predictionInaccurate, quay info, situations with summary) per docs/journyplanner.md. Files: src/entur.js, src/ui/options.js.
