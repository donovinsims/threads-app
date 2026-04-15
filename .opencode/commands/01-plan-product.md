---
description: Plan the Threads Scheduler PWA in concrete build phases
agent: prometheus
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_BIG_PICKLE_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Big Pickle
- Fallback: Nemotron 3 Super Free

You are planning a production-minded mobile-first Threads Scheduler PWA called `threads-app`.

Context:
- This app is a free alternative to BlackTwist for a single owner/operator first.
- It must use the official Threads API through my Threads developer account.
- It must be a PWA, not a native Swift app.
- It must feel like a polished iPhone app.
- Hermes integration is desired if possible.
- The repo instructions in `AGENTS.md` are the source of truth.

Your task:
1. Read `AGENTS.md` carefully.
2. Produce a concrete implementation plan with phases.
3. Identify the smallest lovable MVP.
4. Separate MVP from v1.1 and v1.2.
5. Explicitly call out all risky areas:
   - Threads OAuth and token handling
   - scheduled publishing worker/cron design
   - media uploads
   - PWA installability
   - iPhone haptics limitations
   - Hermes integration uncertainty
6. Propose a simple, low-cost architecture.
7. Propose a clean folder structure.
8. Propose the database schema and background job model.
9. Define acceptance criteria for each phase.
10. End with a recommended execution order that OpenCode can follow immediately.

Important:
- Do not hand-wave.
- Do not give generic startup advice.
- Optimize for a non-technical builder maintaining this later with AI agents.
- Prefer clarity and shipping speed over architectural ego.
- Treat haptics on iPhone as progressive enhancement, not guaranteed hardware feedback.

Output format:
- assumptions
- MVP scope
- phased implementation plan
- architecture
- schema
- risks and mitigations
- acceptance criteria
- exact next build step
