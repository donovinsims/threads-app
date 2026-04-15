# Foundation Learnings

## Date: 2026-04-15

### Patterns Used

1. **App Shell**: Used Next.js App Router with a client component (layout-client.tsx) for the interactive bottom navigation. The layout.tsx remains a server component that exports metadata.

2. **Bottom Navigation**: Implemented as a sticky footer with large tap targets (44px min height). Icons are inline SVG for consistency.

3. **UI Components**: All components use semantic tokens from Tailwind config (bg, surface-0/1/2, text-0/1/2, etc.)

4. **Bottom Sheet**: Implemented with fixed positioning, backdrop blur, and CSS transforms for slide-up animation.

5. **Theme Toggle**: Uses CSS media query (prefers-color-scheme) for automatic dark mode. Manual toggle adds/removes a data-theme attribute.

### Issues Encountered

- Agent timeout prevented full delegation - implemented directly
- Needed to ensure TypeScript types are consistent across all files

### Decisions Made

1. **Mock Data**: Used mock data for posts in /queue page since no API exists yet
2. **Theme Persistence**: Stored theme preference in localStorage
3. **Draft Storage**: Used localStorage with debounced autosave
4. **Thread Posts**: Post type includes optional threadOrder for multi-post threads

## Foundation Summary

### Files Created

**Types:**
- types/post.ts - Post, Draft, PostStatus types
- types/user.ts - UserProfile, AccountConnection types
- types/api.ts - ApiResponse, ApiError, PaginatedResponse types

**UI Components (components/ui/):**
- Button.tsx - primary/secondary/ghost variants, loading state
- Input.tsx, Textarea.tsx - form inputs with labels and errors
- Card.tsx - surface-1 container with header/content/footer
- BottomSheet.tsx - slide-up modal with backdrop
- SegmentedControl.tsx - iOS-style tab picker
- ListRow.tsx - standard list item
- index.ts - barrel export

**Pages:**
- app/queue/page.tsx - Queue view with mock posts, filtering
- app/composer/page.tsx - Post composer with draft autosave
- app/settings/page.tsx - Settings with theme toggle, account placeholder

**Hooks & Lib:**
- hooks/useDraft.ts - localStorage draft persistence with debounce
- lib/threads/client.ts - ThreadsClient interface (stub only)
- lib/scheduler.ts - Scheduler interface (stub only)
- lib/mock-data.ts - Mock post data for development

**Shell:**
- components/PageShell.tsx - BottomNav, PageShell, PageHeader components
- Updated layout-client.tsx with BottomNav

### Real vs Stubbed

**REAL (fully implemented):**
- App shell with bottom navigation
- All UI components
- /queue, /composer, /settings pages
- Local draft persistence (useDraft hook)
- Theme toggle with localStorage
- Semantic tokens throughout
- Mock data for development

**STUBBED (interfaces only, implementation coming later):**
- Threads API client (lib/threads/client.ts)
- Scheduler worker (lib/scheduler.ts)
- OAuth/Account connection flow
- Real API calls
