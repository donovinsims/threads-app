---
description: Make the PWA feel native on iPhone without leaving the web
agent: hephaestus
# To hard-pin a model, uncomment and replace with an exact model ID from `opencode models`.
# model: REPLACE_WITH_MINIMAX_MODEL_ID
---

Recommended UI model for this command:
- Preferred: MiniMax M2.5 Free
- Fallback: Big Pickle

Take the existing Threads Scheduler PWA and polish it until it feels like a high-quality iPhone-first web app.

This is not a generic SaaS restyle.
It should feel calm, premium, soft monochrome, and editorial.

Non-negotiables:
- use the semantic token system only
- preserve the layered surface model
- keep shadows minimal
- keep accent usage sparse and meaningful
- prioritize one-handed mobile ergonomics
- build light and dark mode using the same semantic structure

Focus areas:
1. app shell rhythm and spacing
2. composer hierarchy
3. queue card scanability
4. calendar readability on small screens
5. bottom sheets and modal behavior
6. selected, pressed, hover, and disabled states
7. motion polish
8. installable PWA feel
9. native-like but restrained visual language

Implement a single feedback abstraction:
- use `navigator.vibrate` only where supported
- on iPhone and unsupported browsers, use spring motion, press compression, opacity shifts, subtle sound hooks if appropriate, and state transitions instead
- never make real vibration mandatory

Interaction direction:
- fast tap response
- subtle scale/opacity feedback
- smooth sheet transitions
- sticky composer actions where useful
- obvious focus states
- excellent readability of actual post content
- metadata stays quiet

Audit and improve:
- spacing consistency
- hit targets
- input comfort
- typography hierarchy
- dark mode mapping
- visual noise
- loading/empty/error states

Use frontend engineer heavily when available.
Have oracle/librarian review any questionable browser capability assumptions when available.

End by giving:
- before/after summary
- list of components improved
- remaining rough edges
- exact UI areas that still feel too webby
