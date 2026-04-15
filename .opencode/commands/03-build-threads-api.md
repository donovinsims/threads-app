---
description: Implement Threads auth, publishing, and scheduling pipeline
agent: hephaestus
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_BIG_PICKLE_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Big Pickle
- Fallback: Nemotron 3 Super Free

Implement the Threads integration for the Threads Scheduler PWA.

This pass is about real publishing reliability, not surface polish.

Build:
1. Threads account connect flow
2. OAuth callback flow
3. secure token storage pattern
4. token refresh strategy if required by the chosen architecture
5. connected-account status UI
6. post draft -> scheduled job -> publish pipeline
7. support for:
   - single text post
   - multi-part thread
   - image post if practical in MVP
8. publishing status states:
   - draft
   - scheduled
   - publishing
   - published
   - failed
9. retry and failure visibility
10. publish log per scheduled item
11. safe validation around date/time, character limits, and missing media
12. clean service/adapters for Threads API calls

Important:
- The scheduler logic belongs to this app. Do not pretend the API is a scheduler.
- Store scheduled jobs clearly and deterministically.
- Build idempotency protections so a retry does not double-post.
- Make failure states obvious in the UI.
- Favor boring reliability over clever abstractions.

Implementation quality bar:
- all external API calls live behind a dedicated Threads client/service layer
- all publish state transitions are explicit
- the queue UI reflects truth, not optimistic fantasy
- document required permissions and env vars in the repo

Also:
- leave hooks for analytics, webhooks, and reply management later
- do not overbuild those until scheduling is stable

At the end:
- verify the happy path
- verify one failure path
- document the publish pipeline in plain English for a non-technical builder
