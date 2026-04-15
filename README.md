# Threads Scheduler

A mobile-first PWA for scheduling Threads.com posts.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with semantic design tokens
- **PWA**: Service Worker for offline support
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Threads API credentials (see below)
- Vercel account (for production deployment)

### Local Development

```bash
# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Run development server
npm run dev
```

### Production Setup

#### 1. Vercel Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Pull existing env vars (if any)
vercel env pull
```

#### 2. Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `THREADS_CLIENT_ID` | Yes | Meta App ID from developer.facebook.com |
| `THREADS_CLIENT_SECRET` | Yes | Meta App Secret |
| `THREADS_REDIRECT_URI` | Yes | `https://your-app.vercel.app/api/auth/callback` |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-app.vercel.app` |
| `CRON_SECRET` | Yes | Secure random string (generate with `openssl rand -hex 32`) |
| `HERMES_API_URL` | No | Hermes API endpoint |
| `HERMES_API_KEY` | No | Hermes API key |

#### 3. Vercel Cron Configuration

The `vercel.json` file configures automatic cron runs every 5 minutes:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs automatically on Vercel's free tier.

#### 4. Deploy

```bash
# Deploy to production
vercel --prod
```

## Launch Checklist

- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Update `THREADS_REDIRECT_URI` in Meta Developer Portal to production URL
- [ ] Submit Meta app for review (for `threads_content_publish` permission)
- [ ] Test OAuth flow in production
- [ ] Test a scheduled post publish
- [ ] Verify PWA installable on iPhone (https required)
- [ ] Verify dark mode works
- [ ] Test offline page

## Features

- **OAuth Connection**: Connect your Threads account via secure OAuth 2.0
- **Post Composer**: Create single posts or multi-part threads
- **Scheduling**: Schedule posts for future publication
- **Queue Management**: View and manage all posts by status
- **Offline Support**: PWA with service worker caching
- **Dark Mode**: Automatic system preference detection

## PWA Installation

After running the app, install it as a PWA:

- **iOS**: Share button → Add to Home Screen
- **Android**: Chrome menu → Install app

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | GET | Start OAuth flow |
| `/api/auth/callback` | GET | OAuth callback |
| `/api/auth/status` | GET | Connection status |
| `/api/auth/disconnect` | POST | Disconnect account |
| `/api/posts` | GET/POST/PUT/DELETE | Post CRUD |
| `/api/cron` | GET | Process scheduled posts (Vercel Cron) |

## Troubleshooting

### "Missing Threads OAuth configuration"

Ensure all required env vars are set:
- `THREADS_CLIENT_ID`
- `THREADS_CLIENT_SECRET`
- `THREADS_REDIRECT_URI`

### "Session expired" / "Please reconnect"

Your OAuth token has expired. Go to Settings and reconnect your account.

### Posts not publishing

Check:
1. You're connected in Settings
2. Posts are scheduled for a future time
3. Cron jobs are running
4. Network connectivity

### Offline page shows

You're currently offline. Check your internet connection and try again.

### PWA not installable

Ensure:
- HTTPS is being used (required for PWA install)
- Icons are present in `/public`

### Meta App Review Required

To publish posts in production, you need `threads_content_publish` permission approved through Meta's app review process.

## Project Structure

```
threads-app/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── composer/            # Post composer
│   ├── queue/              # Post queue
│   ├── settings/           # Settings page
│   └── offline/            # Offline fallback
├── components/             # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Core logic
│   ├── auth/              # Session management
│   ├── threads/           # Threads API client
│   └── hermes/            # Hermes AI adapter
├── public/                # Static assets
│   └── sw.js             # Service Worker
└── types/                # TypeScript definitions
```

## Design Tokens

The app uses semantic tokens (`--token-name`) automatically mapped for light/dark mode:

| Token | Usage |
|-------|-------|
| `--bg` | App canvas |
| `--surface-0` | Cards, sheets, nav |
| `--surface-1` | Nested content |
| `--surface-2` | Inputs, controls |
| `--text-0` | Primary content |
| `--text-1` | Metadata |
| `--text-2` | Disabled |
| `--link` | Primary actions |
| `--border-0/1/2` | Border variants |

## Development

See [AGENTS.md](./AGENTS.md) for full product requirements and architectural constraints.