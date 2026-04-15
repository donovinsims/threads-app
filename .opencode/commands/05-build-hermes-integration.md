---
description: Add Hermes agent integration through a clean adapter layer
agent: hephaestus
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_BIG_PICKLE_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Big Pickle
- Fallback: Nemotron 3 Super Free

Add Hermes integration to the Threads Scheduler PWA in a way that does not contaminate the whole codebase.

Important:
- Hermes integration is optional at runtime but important strategically.
- Build it behind a dedicated adapter interface.
- Do not hardcode Hermes details across UI components.
- If Hermes capabilities are not fully known, implement the interface, mock adapter, settings UI, and contract docs so the integration can be completed cleanly later.

Target Hermes capabilities:
- rewrite post copy
- expand a short post into a thread
- suggest publishing time
- summarize this week's queue
- optionally trigger or confirm publishing
- generate a draft from a simple prompt

Build:
1. Hermes adapter interface
2. settings screen for Hermes connection details
3. action sheet in composer for Hermes-powered actions
4. loading/error states for agent actions
5. safe timeout and retry handling
6. clear human override flow
7. audit log or event log for Hermes actions

Preferred connection order:
1. HTTP/webhook API
2. MCP bridge if that is how Hermes is exposed
3. mock adapter fallback if real connection is not available

Constraints:
- user always stays in control
- generated copy never silently publishes
- publishing still works without Hermes
- all Hermes behavior is explicitly visible in the UI

At the end:
- document the Hermes contract in plain English
- show what env vars or settings are needed
- explain what is real vs mocked
