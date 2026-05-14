# ⚡ Signal Guard AI

> Your AI trading discipline coach. Not an auto-trader — every trade requires manual human approval.

**Built for:** A trader with $150 capital using Robinhood and crypto  
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Clerk · Neon PostgreSQL · Prisma · Claude API

---

## ⚠️ Disclaimer

Signal Guard AI is for personal educational and decision-support use only. It does **not** guarantee profits, **does not** predict markets with certainty, and **does not** place trades automatically. All trade decisions are made by you, the human. Trading involves substantial risk of loss. Never trade with money you cannot afford to lose. **This is not financial advice.**

---

## 🚀 Getting Started

### 1. Clone / Copy
```bash
cd signal-guard-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your real credentials:
- **Clerk:** Create a project at [clerk.com](https://clerk.com) and grab keys
- **Neon PostgreSQL:** Create a DB at [neon.tech](https://neon.tech) — free tier works
- **Anthropic:** Get a key at [console.anthropic.com](https://console.anthropic.com)
- **Clerk Webhook:** Set webhook URL to `https://your-domain.com/api/webhooks/clerk`

### 4. Set up database
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to Neon DB
```

### 5. Run development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
signal-guard-ai/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   ├── dashboard/
│   │   ├── layout.tsx                    # Sidebar layout
│   │   ├── page.tsx                      # Main dashboard
│   │   ├── morning-brief/page.tsx        # Morning check-in + AI brief
│   │   ├── scanner/page.tsx              # Signal scanner table
│   │   ├── trade-plan/[id]/page.tsx      # Full trade plan
│   │   ├── journal/
│   │   │   ├── page.tsx                  # Journal list
│   │   │   ├── new/page.tsx              # Log a trade
│   │   │   └── [id]/page.tsx            # Trade detail + EOD review
│   │   ├── performance/page.tsx          # Performance dashboard
│   │   ├── strategies/page.tsx           # Strategy library
│   │   └── settings/page.tsx            # Account settings
│   └── api/
│       ├── morning-brief/route.ts        # POST: generate AI brief
│       ├── signals/
│       │   ├── route.ts                  # GET: list signals
│       │   └── [id]/
│       │       ├── route.ts              # GET: single signal
│       │       ├── approve/route.ts      # POST: approve signal
│       │       └── skip/route.ts         # POST: skip signal
│       ├── trades/
│       │   ├── route.ts                  # GET/POST: trades
│       │   └── [id]/
│       │       ├── route.ts              # GET: single trade
│       │       └── review/route.ts      # POST: AI EOD review
│       ├── performance/route.ts          # GET: performance stats
│       ├── settings/route.ts             # GET/PUT: user settings
│       ├── strategies/route.ts           # GET/POST: strategies
│       └── webhooks/clerk/route.ts       # Clerk user creation webhook
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── claude.ts          # Claude AI integration
│   ├── risk-rules.ts      # Risk rules engine (6 hard rules)
│   ├── mock-signals.ts    # Mock signals + CoinGecko live prices
│   └── utils.ts           # Formatting utilities
├── prisma/
│   └── schema.prisma      # Database schema
├── middleware.ts          # Clerk auth middleware
└── .env.example           # Environment variable template
```

---

## 🛡️ Risk Rules Engine

All 6 hard rules are checked before showing any trade plan. Warnings are advisory — human always decides.

| Rule | Description |
|------|-------------|
| RULE_001 | Never risk more than 2% of account on any single trade |
| RULE_002 | Max 3 open positions at once |
| RULE_003 | No trading first 15 min of market open (9:30–9:45 AM ET) |
| RULE_004 | Stop after 2 consecutive losses in a day |
| RULE_005 | Minimum R:R ratio of 1.5:1 |
| RULE_006 | Flag high-impact news events within 2 hours |

---

## 📦 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic Claude API key (fallback if user hasn't set own key) |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL for webhooks (default: http://localhost:3000) |

---

## 🎨 Design System

| Color | Use |
|-------|-----|
| `#0a0f1e` | Page background |
| `#0f172a` | Card background |
| `#00d4ff` (cyan) | Accent, links, active state |
| `#22c55e` (green) | Profit, bullish, success |
| `#ef4444` (red) | Loss, bearish, danger |
| `#eab308` (yellow) | Warning, score 70-79 |
| `#f97316` (orange) | Score 80-89, no-trade day |

---

## 🗺️ Pages

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/dashboard` | Main hub with bias banner, signals, journal |
| `/dashboard/morning-brief` | 6-question check-in + AI market brief |
| `/dashboard/scanner` | Signal scanner table (≥70 score only, max 3) |
| `/dashboard/trade-plan/[id]` | Full trade plan with risk checks |
| `/dashboard/journal` | Trade journal list |
| `/dashboard/journal/new` | Log a new trade |
| `/dashboard/journal/[id]` | Trade detail + AI EOD review |
| `/dashboard/performance` | Stats: win rate, P&L, profit factor |
| `/dashboard/strategies` | Strategy library |
| `/dashboard/settings` | Account + risk settings |

---

## 📡 API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/morning-brief` | Generate AI morning brief |
| GET | `/api/signals` | Get scored signals (with live CoinGecko prices) |
| GET | `/api/signals/[id]` | Get single signal |
| POST | `/api/signals/[id]/approve` | Approve signal → log to journal |
| POST | `/api/signals/[id]/skip` | Skip signal |
| GET | `/api/trades` | List user trades |
| POST | `/api/trades` | Create journal entry |
| GET | `/api/trades/[id]` | Get single trade |
| POST | `/api/trades/[id]/review` | Generate AI EOD review |
| GET | `/api/performance` | Aggregate performance stats |
| GET/PUT | `/api/settings` | User settings |
| POST | `/api/strategies` | Create strategy |
| GET | `/api/strategies` | List strategies |
| POST | `/api/webhooks/clerk` | Clerk user creation webhook |

---

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Set all environment variables
4. Deploy

Vercel handles Next.js natively — no extra configuration needed.

---

*Built with ❤️ for disciplined trading. Remember: no trade today is always a valid outcome.*
