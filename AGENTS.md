# threads-app

## Mission
Build a mobile-first Threads.com scheduler PWA called `threads-app` that feels calm, premium, fast, and native on iPhone, while staying fully web-based.

This app is a free alternative to BlackTwist for a single owner/operator first.
Primary goal:
- connect my Threads developer account
- compose single posts and multi-post threads
- save drafts
- schedule posts for future publishing
- show queue and calendar
- publish reliably through the official Threads API
- optionally hand off work to my Hermes agent when possible

## Product Constraints
- Use web tech only. No Swift, no React Native, no native wrappers.
- Must be installable as a PWA.
- Must be mobile-first and optimized for iPhone one-handed use.
- Must feel like a polished iOS app through layout, motion, spacing, bottom-sheet flows, and subtle feedback.
- Do not fake capability claims. Treat haptics as progressive enhancement only.
- Build graceful fallback behavior when vibration/haptics are unsupported.
- Keep infra cheap and simple.
- Single-user first. Design clean extension points for multi-account or team support later.

## Threads API Scope
Support:
- OAuth connection flow for my Threads developer account
- text posts
- image posts
- video posts if reasonable in MVP
- multi-part thread composer
- scheduled publishing via app-side queue/worker
- publish status and failure handling
- basic analytics/insights if easy after MVP
- reply management and webhooks only if they fit cleanly after core scheduling works

## Hermes Integration
Treat Hermes as optional but important.
Implement Hermes through an adapter layer, not hardcoded app logic.

Preferred order:
1. direct HTTP/Webhook adapter if Hermes exposes an API
2. MCP-compatible bridge if Hermes is better exposed that way
3. local mock adapter + contract docs if Hermes interface is not available yet

Hermes actions to support if possible:
- draft or rewrite post copy
- expand a post into a thread
- suggest best posting time
- trigger publish workflow
- summarize scheduled queue
- auto-generate content from a short prompt

## UI Direction
Use a soft monochrome system.
The interface should feel closer to a native iPhone publishing tool than a SaaS dashboard.

Non-negotiables:
- mostly grayscale
- layered surfaces instead of heavy shadows
- strong text hierarchy
- sparse accent usage
- clean in light and dark mode
- semantic design tokens only
- no hardcoded hex values in components

## Design Tokens
Use semantic tokens only:
- --bg
- --surface-0
- --surface-1
- --surface-2
- --text-0
- --text-1
- --text-2
- --border-0
- --border-1
- --border-2
- --link

Rules:
- --bg for app canvas
- --surface-0 for primary cards/shell/nav/modals
- --surface-1 for nested content blocks
- --surface-2 for interactive controls and input wells
- --text-0 for primary content
- --text-1 for secondary metadata
- --text-2 for disabled/placeholder
- --link as the single primary action color
- no random colors outside this system

## UX Rules
- Prioritize composer and queue over everything else
- Large tap targets
- Bottom-sheet interactions on mobile
- Sticky bottom action bar where useful
- Strong draft autosave
- Clear scheduling flow with minimal friction
- Fast perceived performance
- Accessible contrast and obvious disabled states
- Motion should be subtle, springy, and restrained

## Haptics and Feedback
Because web haptics support is inconsistent on iPhone:
- build a single feedback abstraction
- use navigator.vibrate only where supported
- on iPhone rely on motion, opacity, scale, pressed states, and optional sound cues
- never make real device vibration required for UX clarity

## Architecture Goals
The codebase should be understandable by a non-technical builder.
Prefer:
- obvious folders
- documented env vars
- small reusable modules
- explicit services/adapters
- typed API boundaries
- clear background job flow for scheduled publishing

## Must-Have Screens
- onboarding/connect Threads account
- home queue
- calendar view
- composer for single posts and threads
- draft detail/edit screen
- schedule sheet
- post preview
- settings
- Hermes panel if available

## Acceptance Standard
Do not stop at “works on desktop”.
Done means:
- installable PWA
- mobile-first
- reliable draft persistence
- reliable scheduled publishing
- queue state is obvious
- dark mode works through token remapping
- no hardcoded colors
- no shadow-heavy SaaS look
- code is documented enough that I can keep using it with AI coding agents later

## Working Style
- Think in small phases
- Make a plan first
- Use specialist agents aggressively when helpful
- Ask oracle/librarian to confirm external API details when those agents exist in the current install
- Ask frontend engineer to own mobile polish and interaction quality when that agent exists in the current install
- Do not overbuild analytics or multi-user features before scheduling is solid
