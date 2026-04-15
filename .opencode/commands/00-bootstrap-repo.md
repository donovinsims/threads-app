---
description: Create the threads-app repo structure and stop before building
agent: atlas
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_BIG_PICKLE_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Big Pickle
- Fallback: MiniMax M2.5 Free

Create a new repo/app called `threads-app`.

Set it up as a mobile-first PWA project intended to become a Threads.com post scheduler using the official Threads API.

Then do these exact setup tasks:

1. Initialize the repo
2. Create `AGENTS.md` at the repo root if it does not already exist
3. Create `.opencode/commands/`
4. Verify these command files exist in `.opencode/commands/`:
   - `00-bootstrap-repo.md`
   - `01-plan-product.md`
   - `02-build-foundation.md`
   - `03-build-threads-api.md`
   - `04-build-ios-ui.md`
   - `05-build-hermes-integration.md`
   - `06-hardening-and-launch.md`
5. Stop after creating the repo structure and files
6. Show me the resulting file tree
7. Do not start building the app yet

Assume I will run the commands one by one after this.
