---
description: Harden the app for real use and prepare it for launch
agent: sisyphus
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_NEMOTRON_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Nemotron 3 Super Free
- Fallback: Big Pickle

Harden the Threads Scheduler PWA for real daily use.

Priorities:
- reliability
- obvious state handling
- installability
- recoverability
- non-technical maintainability

Audit:
1. OAuth failure states
2. expired token behavior
3. scheduled job retry logic
4. duplicate publish prevention
5. queue truthfulness
6. draft autosave
7. offline and flaky network handling where practical
8. PWA install prompts and manifest correctness
9. service worker sanity
10. loading, empty, and error states
11. accessibility
12. mobile performance
13. dark mode consistency
14. settings clarity
15. documentation quality

Add:
- health/status panel for connected Threads account
- clear failed-post recovery path
- human-readable publish logs
- simple diagnostics page if useful
- plain-English README sections for setup, env vars, publishing flow, and troubleshooting

Do not:
- explode scope into enterprise analytics
- overbuild team roles
- clutter the interface
- invent visual styles outside the design token system

Use available specialist agents for focused review.
Be critical.
Fix rough edges instead of merely listing them.

Finish with:
- what was hardened
- what still blocks launch
- recommended pre-launch checklist
- exact next highest-value task
