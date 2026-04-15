# threads-app Implementation Plan

## Assumptions

1. **Single-user focus**: First version serves one Threads account only (me as the owner/operator)
2. **Existing Meta developer account**: I already have a Threads app created in the Meta developer portal
3. **Public media hosting**: Images/videos will be hosted on a public server (Vercel blob or external)
4. **Web-only deployment**: Deploying to Vercel (easiest for Next.js + Cron jobs)
5. **No paid external services**: Using free tier where possible to keep infra cheap
6. **Token storage**: Using encrypted cookies or server-side session store (no database for MVP)

## MVP Scope (v0.1 - "Ship It")

The smallest lovable product that validates the core workflow:

### Must Have (MVP)
- [ ] OAuth connection flow for my Threads account
- [ ] Basic composer (text-only posts, max 500 chars)
- [ ] Draft auto-save (localStorage + optional server sync)
- [ ] Simple queue list view (scheduled posts)
- [ ] Manual "publish now" trigger
- [ ] Basic success/failure UI

### Must NOT Have (MVP)
- [ ] Image/video posts
- [ ] Multi-post thread composer
- [ ] Calendar view
- [ ] Hermes integration
- [ ] Scheduled auto-publish (cron worker)
- [ ] Analytics/insights

## Phased Implementation Plan

### Phase 1: Foundation (v0.1)
**Goal**: Connect account + publish one text post manually

1. Set up Threads OAuth flow (authorization window)
2. Implement access token exchange + refresh
3. Create basic text composer component
4. Add "publish now" button
5. Handle publish success/failure UI only

**Exit Criteria**: Can log in and publish a text post manually

### Phase 2: Queue & Drafts (v0.2)
**Goal**: Queue management + draft persistence

1. Add draft auto-save (localStorage)
2. Create queue list view (in-memory on server)
3. Add edit/delete draft actions
4. Add status indicators (draft/scheduled/published/failed)
5. Persist queue to server (file or simple KV)

**Exit Criteria**: Can save drafts, see them in queue, edit before publish

### Phase 3: Scheduling (v0.3)
**Goal**: Time-based publishing

1. Add schedule picker (date/time)
2. Implement background cron worker (Vercel Cron)
3. Queue processor: check due posts every N minutes
4. Auto-publish when due
5. Retry logic for failures (3 attempts)

**Exit Criteria**: Can schedule a post and have it publish automatically

### Phase 4: Media Support (v0.4)
**Goal**: Images and videos

1. Add image upload component
2. Set up media storage (Vercel Blob or external)
3. Update composer for media attachments
4. Handle two-step container flow
5. Show media preview in composer

**Exit Criteria**: Can upload image and publish as image post

### Phase 5: Thread Composer (v0.5)
**Goal**: Multi-post threads

1. Add thread builder UI (multi-card composer)
2. Thread ordering (drag/reorder)
3. Thread preview (show as connected posts)
4. Publish as thread (sequential with reply_to_id)
5. Thread status tracking

**Exit Criteria**: Can compose and publish a multi-post thread

### Phase 6: Hermes Integration (v0.6)
**Goal**: AI assistance (if Hermes available)

1. Create Hermes adapter interface
2. Build mock adapter (for testing)
3. Add AI action panel (draft, expand, suggest time)
4. Connect to real Hermes when API available

**Exit Criteria**: AI actions work (even as mock)

### Phase 7: Hardening & Launch (v0.7)
**Goal**: Production-ready

1. PWA install verification
2. Error handling improvements
3. Offline fallback polish
4. Dark mode full verification
5. App review submission (if needed)
6. Deploy to production

**Exit Criteria**: Installable PWA working reliably

---

## Architecture

### Tech Stack (Confirmed)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with semantic tokens
- **Deployment**: Vercel
- **Cron**: Vercel Cron (free tier)
- **Storage**: File-based or simple KV (no SQL for MVP)
- **Auth**: NextAuth.js with Threads provider (or custom OAuth)

### Folder Structure

```
threads-app/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (grouped)
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (app)/                  # App routes (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Queue home
│   │   ├── composer/page.tsx   # Post composer
│   │   ├── calendar/page.tsx   # Calendar view
│   │   └── settings/page.tsx
│   ├── api/                    # API routes
│   │   ├── auth/[...]/route.ts # NextAuth endpoints
│   │   ├── posts/route.ts     # Posts CRUD
│   │   ├── publish/route.ts  # Trigger publish
│   │   └── cron/route.ts      # Cron worker
│   ├── globals.css
│   ├── layout.tsx
│   └── manifest.ts
├── components/                  # Reusable UI components
│   ├── composer/              # Composer components
│   │   ├── TextEditor.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── ThreadBuilder.tsx
│   │   └── Preview.tsx
│   ├── queue/                # Queue components
│   │   ├── QueueList.tsx
│   │   ├── QueueItem.tsx
│   │   └── SchedulePicker.tsx
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   └── ...
│   └── hermes/               # Hermes components
│       └── AIPanel.tsx
├── lib/                      # Utilities & clients
│   ├── auth.ts               # Auth utilities
│   ├── threads/              # Threads API client
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── errors.ts
│   ├── hermes/               # Hermes adapter
│   │   ├── adapter.ts        # Interface
│   │   ├── mock.ts         # Mock implementation
│   │   └── http.ts        # HTTP adapter
│   ├── scheduler.ts          # Scheduling logic
│   └── storage.ts           # Storage interface
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useDraft.ts
│   ├── useQueue.ts
│   └── useHaptics.ts
├── types/                    # TypeScript types
│   ├── post.ts
│   ├── user.ts
│   └── api.ts
└── public/
    ├── sw.js               # Service worker
    └── icons/
```

### Background Job Flow (Scheduling)

```
┌─────────────────────────────────────────────────────────────┐
│                      CRON WORKER                           │
│  (Vercel Cron - runs every 5 minutes)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Fetch due posts (WHERE scheduled_at <= NOW)              │
│  2. For each due post:                                   │
���     ┌───────────────────────────────────────────────┐       │
│     │  3. Call Threads API /threads_publish         │       │
│     │  4. Update status: published / failed        │       │
│     │  5. If failed: increment retry_count         │       │
│     │  6. If retry_count >= 3: mark failed_perm    │       │
│     └───────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Posts Table (JSON/file-based)

```typescript
interface Post {
  id: string;                    // UUID
  text: string;                 // Post content (max 500 chars)
  media_urls?: string[];        // Image/video URLs
  thread_index?: number;       // Position in thread (0 = first)
  thread_id?: string;         // Thread group ID
  
  // Scheduling
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'failed_perm';
  scheduled_at?: string;       // ISO timestamp
  
  // Metadata
  threads_media_id?: string;  // Threads API container ID
  threads_post_id?: string;   // Final published post ID
  created_at: string;
  updated_at: string;
  
  // Retry info
  retry_count: number;        // 0-3
  last_error?: string;
}
```

### User Session (Encrypted Cookie)

```typescript
interface Session {
  user_id: string;            // Threads user ID
  access_token: string;       // Long-lived token
  token_expires_at: string;   // Expiry timestamp
}
```

---

## Threads API Integration

### OAuth Flow
```
1. Redirect to Meta Authorization Window
   https://www.threads.net/dialog/oauth?
     client_id=<APP_ID>&
     redirect_uri=<CALLBACK_URL>&
     scope=threads_basic,threads_content_publish&
     response_type=code

2. Exchange code for access token
   POST https://graph.threads.net/v1.0/oauth/access_token
     client_id, client_secret, code, redirect_uri

3. Get long-lived token (60 days)
   POST https://graph.threads.net/v1.0/oauth/access_token
     grant_type=fb_exchange_token&
     fb_exchange_token=<SHORT_LIVED_TOKEN>
```

### Publishing Flow (Two-Step)
```
1. Create container:
   POST https://graph.threads.net/v1.0/<USER_ID>/threads
     media_type=TEXT
     text=<POST_TEXT>
   
   → Returns: { id: "<CONTAINER_ID>" }

2. Publish container:
   POST https://graph.threads.net/v1.0/<USER_ID>/threads_publish
     creation_id=<CONTAINER_ID>
   
   → Returns: { id: "<POST_ID>" }
```

### Rate Limits
- 250 posts per 24 hours (per profile)
- Carousels count as 1 post

---

## Hermes Integration Approach

### Adapter Interface

```typescript
interface HermesAdapter {
  // Preferred: HTTP/Webhook (if available)
  draft(prompt: string): Promise<string>;
  expandPost(text: string): Promise<string[]>;
  suggestTime(): Promise<string>;
  triggerPublish(postIds: string[]): Promise<void>;
  summarizeQueue(): Promise<string>;
}

// Implementation priority:
// 1. HTTP adapter (direct API calls)
// 2. Webhook adapter  
// 3. MCP bridge
// 4. Mock adapter (local for dev)
```

### Mock Implementation
- local mock that returns placeholder responses
- Allows UI to be built without real Hermes
- Swap adapter when real API available

---

## Risks and Mitigations

### Risk 1: Threads API Token Expiry
- **Risk**: Short-lived tokens expire during cron run
- **Mitigation**: Use long-lived tokens (60 days), refresh before expiry

### Risk 2: App Review Delays
- **Risk**: Meta app review takes 2-4 weeks
- **Mitigation**: Start early, test with Threads testers first

### Risk 3: Media URL Requirements
- **Risk**: Media must be publicly accessible
- **Mitigation**: Use Vercel Blob or similar (not local files)

### Risk 4: Cron Reliability
- **Risk**: Vercel Cron can be delayed under load
- **Mitigation**: Check for "due" posts, not exact time; allow 5-min window

### Risk 5: iPhone Haptics
- **Risk**: navigator.vibrate inconsistent
- **Mitigation**: Visual/opacity feedback primary, haptics enhancement only

### Risk 6: Rate Limits
- **Risk**: 250 posts/day limit
- **Mitigation**: Show warning when queue would exceed; no per-post batching

### Risk 7: Multi-post Threads
- **Risk**: Sequential publishing with reply_to_id complex
- **Mitigation**: Use auto_publish for first, then reply_to for subsequent

---

## Acceptance Criteria

### Phase 1 (Foundation)
- [ ] Can log in via Threads OAuth
- [ ] Can compose text post (500 char limit)
- [ ] Can publish and see success message
- [ ] Can handle publish errors gracefully

### Phase 2 (Queue & Drafts)
- [ ] Drafts auto-save while composing
- [ ] Queue shows all posts
- [ ] Can edit existing draft
- [ ] Can delete draft

### Phase 3 (Scheduling)
- [ ] Can pick future date/time
- [ ] Cron publishes when due
- [ ] Retry works (3 attempts)
- [ ] Status updates correctly

### Phase 4 (Media)
- [ ] Can upload image
- [ ] Image previews in composer
- [ ] Image post publishes correctly

### Phase 5 (Threads)
- [ ] Can add multiple posts
- [ ] Can reorder thread
- [ ] Thread publishes as connected posts

### Phase 6 (Hermes)
- [ ] AI panel shows actions
- [ ] Mock returns responses
- [ ] Can swap to real adapter

### Phase 7 (Hardening)
- [ ] PWA installs on iPhone
- [ ] Dark mode works fully
- [ ] No console errors on key flows

---

## Recommended Execution Order

**Start with 02-build-foundation:**

1. **Set up auth** → NextAuth or custom OAuth with Threads
2. **Build composer UI** → Text input + publish button
3. **Add Threads API client** → lib/threads/client.ts
4. **Connect publish flow** → Create container → Publish
5. **Test end-to-end** → Publish first real post

**After Foundation is solid, proceed to:**
- 02-build-foundation (queue, drafts)
- 03-build-threads-api (scheduling, media, threads)
- 04-build-ios-ui (polish the mobile UX)
- 05-build-hermes-integration (AI features)
- 06-hardening-and-launch (production ready)

---

## Notes for Future Maintainers

- Threads API base URL: `https://graph.threads.net/v1.0/`
- Text limit: 500 characters (emojis count as bytes)
- Rate limit: 250 posts/24 hours
- Media must be publicly accessible URLs
- App review required for production permissions
- Use long-lived tokens (refresh at 50 days)