---
description: Build the foundation of the Threads Scheduler PWA
agent: atlas
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_BIG_PICKLE_MODEL_ID
---

Recommended UI model for this command:
- Preferred: Big Pickle
- Fallback: MiniMax M2.5 Free

Build the project foundation for the Threads Scheduler PWA described in `AGENTS.md`.

Goals for this pass:
- scaffold the app shell
- set up the project structure
- wire up PWA basics
- create token-driven theming
- create the data model
- create draft persistence
- stub the scheduling pipeline
- leave the codebase runnable and documented

Requirements:
- mobile-first from the first commit
- semantic design tokens only
- light and dark mode through token remapping
- no hardcoded hex values in components
- no shadow-heavy dashboard styling
- obvious component structure
- clear env var docs
- strict typing where possible

Build:
1. app shell optimized for iPhone
2. bottom navigation or similarly quiet mobile nav
3. queue screen
4. composer screen shell
5. settings screen shell
6. tokenized design system and global CSS variables
7. reusable card, input, button, sheet, segmented control, list row components
8. local draft persistence
9. schedule entity and queue entity
10. worker/job abstraction for future scheduled publishing
11. PWA manifest, icons/placeholders, service worker basics, installability checks
12. clear README section explaining how the app is organized

UI rules:
- use `--bg`, `--surface-0/1/2`, `--text-0/1/2`, `--border-0/1/2`, `--link` only
- composer should feel calm and editorial
- queue should be scannable at a glance
- large tap targets
- smooth bottom-sheet patterns on mobile

Use specialist agents where helpful:
- frontend engineer for layout, motion, and polish when available
- oracle/librarian to sanity check any external assumptions when available

Before finishing:
- run the app
- fix obvious type or lint issues
- verify dark mode
- verify no component hardcodes color values
- summarize exactly what was built and what is stubbed
