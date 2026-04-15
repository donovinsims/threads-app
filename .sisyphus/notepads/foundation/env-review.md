# Environment Setup Review

## .env.local Gitignore Verification

✅ `.env.local` is properly gitignored in `.gitignore`:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Required Environment Variables

### For Threads API Integration

| Variable | Purpose | Required |
|-----------|---------|----------|
| `THREADS_APP_ID` | Meta App ID (from Meta Developer Portal) | Yes |
| `THREADS_APP_SECRET` | Meta App Secret | Yes |
| `THREADS_REDIRECT_URI` | OAuth callback URL | Yes |

### For App Configuration

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public-facing URL for OAuth | Yes (production) |

### For Scheduling (Production)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VERCEL_CRON_SECRET` | Secret for Vercel Cron verification | Yes (production) |

### For Hermes Integration (Optional)

| Variable | Purpose | Required |
|----------|---------|----------|
| `HERMES_API_URL` | Hermes API endpoint | No |
| `HERMES_API_KEY` | Hermes API key | No |

---

## Current .env.example

```bash
# Threads API Configuration
THREADS_CLIENT_ID=your_threads_client_id_here
THREADS_CLIENT_SECRET=your_threads_client_secret_here
THREADS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hermes Integration (optional)
HERMES_API_URL=your_hermes_api_url_here
HERMES_API_KEY=your_hermes_api_key_here
```

---

## Current Stubbed Design Review

### Threads Client (`lib/threads/client.ts`)

**Current State:**
- Interface only with 10 methods
- All methods throw "not implemented" errors
- No actual API calls

**Proposed Implementation:**
1. OAuth flow using Meta's authorization window
2. Token exchange (short-lived → long-lived)
3. Token refresh before expiry (60-day lifecycle)
4. All Graph API calls via `fetch()` to `https://graph.threads.net/v1.0/`

### Scheduler (`lib/scheduler.ts`)

**Current State:**
- localStorage-based job queue
- Job status: pending → running → completed/failed
- `isJobDue()` checks if pending + past scheduled time

**Proposed Implementation:**
1. API route `/api/cron` triggered by Vercel Cron (every 5 min)
2. Fetches due posts where `scheduledAt <= now` AND `status === 'scheduled'`
3. For each due post:
   - Set status to `publishing`
   - Call Threads API (create container → publish)
   - On success: set status to `published`
   - On failure: increment `retryCount`, set status to `failed` if >= 3

---

## Proposed OAuth + Publishing + Scheduling Approach

### OAuth Flow (Plain English)

1. User clicks "Connect Threads" → redirect to Meta authorization window
2. User approves → Meta redirects to `/api/auth/callback?code=XXX`
3. Server exchanges code for access token (short-lived)
4. Server exchanges short-lived for long-lived (60 days)
5. Token stored server-side (encrypted cookie or server-side session)
6. Token passed to Threads client for API calls

### Publishing Flow (Plain English)

1. User creates post in composer
2. Post saved with status `draft` or `scheduled`
3. If scheduled: job created in scheduler
4. Cron runs every 5 minutes:
   - Finds posts where `status === 'scheduled'` AND `scheduledAt <= now`
   - For each, call Threads API:
     - Step 1: POST to `/threads` with media_type=TEXT → get container_id
     - Step 2: POST to `/threads_publish` with container_id → get post_id
   - Update post status: `published` (with post_id) or `failed` (with error)

### Idempotency Protections

- Check if post already has `threads_post_id` before publishing
- If status already `published`, skip (don't re-publish)
- Use `retryCount` field to limit to 3 attempts
- Log all attempts with timestamps

### Failure Visibility

- Post status shows `failed` with error message
- Retry button available for failed posts
- Retry count visible (e.g., "Failed - 2/3 retries")
- Publish log entry created for each attempt

---

## What's Ready to Implement

Once you provide credentials, I can implement:

1. ✅ OAuth server-side routes with proper token handling
2. ✅ Threads API client with real fetch calls
3. ✅ Cron API route for scheduled publishing
4. ✅ Proper state transitions (draft → scheduled → publishing → published/failed)
5. ✅ Retry logic with visibility
6. ✅ Idempotency checks

---

## Next Step

Please provide your:
1. **THREADS_APP_ID** (from Meta Developer Portal → App → App ID)
2. **THREADS_APP_SECRET** (from Meta Developer Portal → App → App Secret)

I'll update `.env.example` and then implement the real integration.

**Do not provide real values here** - I'll create a secure input method for you.