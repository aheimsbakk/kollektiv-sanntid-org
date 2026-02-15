Title: Request transport mode fields from Entur GraphQL

What I will change:
- Extend GraphQL selection for `estimatedCalls` to include several candidate fields that may carry transport mode information (serviceJourney -> journey.transportMode, transportMode, transportSubmode, product).
- Add extended-query variants tried before the base queries so we can parse a normalized `mode` when the server supports it while preserving existing fallbacks.

Files to be modified:
- src/entur.js
- agent/CONTEXT.md

This worklog is created before implementing the change as required by AGENT.md.
