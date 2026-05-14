# Signal Guard AI — Claude Code Build Brief
**Version:** 1.0 MVP | **Date:** 2026-05-13

## What You Are Building

**Signal Guard AI** — a personal AI morning trading signal and discipline system.

A Next.js 14 web app that:
- Gives the user a morning market briefing with AI-generated signals
- Scores trade setups 0–100 and only surfaces setups ≥ 70
- Generates full trade plans with entry, stop-loss, take-profit, position sizing
- Enforces hard risk rules (1% max risk, 2 trades/day, stop after 2 losses, no auto-execution)
- Provides a trade journal and performance dashboard
- Supports paper mode and tiny-live manual mode ($20 live starting capital)
- Includes a daily check-in flow and end-of-day review agent

## Key Product Facts

- **Product name:** Signal Guard AI
- **User:** Kiel Green — beginner/intermediate trader
- **Broker:** Robinhood (manual execution only — no API trading)
- **Live starting capital:** $20 (when ready — paper mode is default)
- **Paper mode simulated capital:** $500
- **Max risk per trade:** 1% of account ($0.20 live / $5.00 paper)
- **Max trades per day:** 2
- **Stop after:** 2 losing trades in one day
- **Minimum signal score to trade:** 70/100
- **Minimum R:R ratio:** 2:1
- **No auto-execution ever in MVP**

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Neon PostgreSQL via DATABASE_URL env var
- **ORM:** Prisma
- **Auth:** Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY)
- **AI:** Anthropic Claude (ANTHROPIC_API_KEY)
- **Market data:** Yahoo Finance unofficial API (yfinance pattern via fetch) + CoinGecko free API
- **Charts:** TradingView Lightweight Charts (CDN, free)
- **Hosting:** Vercel

## Environment Variables Needed (.env.local)

```
# Database
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI
ANTHROPIC_API_KEY=

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## MVP Screens to Build (in priority order)

1. **`/` (Home → Morning Brief)** — market bias, VIX, SPY/QQQ/BTC snapshot, top 3 setups, best window
2. **`/checkin`** — daily check-in (6 questions), outputs trade/no-trade/reduced recommendation
3. **`/scanner`** — signal scanner table, scores 0–100, grade badges, filter by market/direction
4. **`/plan/[id]`** — full trade plan card: entry zone, stop, TP1, TP2, R:R, position size, risk check results, approve/skip buttons
5. **`/journal`** — trade journal list + add entry form (16 fields)
6. **`/journal/new`** — new journal entry form
7. **`/performance`** — dashboard: win rate, avg win/loss, profit factor, expectancy, max drawdown
8. **`/eod`** — end-of-day review (8 questions, AI assessment, grade)
9. **`/strategy`** — strategy rule builder (paste raw notes → AI converts to objective rules)
10. **`/settings`** — guardrails: account size, mode switch (paper/live), max risk %, max trades/day

## Database Schema (Prisma)

Create `prisma/schema.prisma` with these models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model UserSettings {
  id             String   @id @default(cuid())
  userId         String   @unique
  tradingMode    String   @default("paper")    // "paper" | "tiny_live"
  accountSize    Decimal  @default(20.00)      // $20 live default
  paperSize      Decimal  @default(500.00)     // $500 simulated paper
  maxRiskPct     Decimal  @default(0.01)       // 1%
  maxTradesDay   Int      @default(2)
  maxLossDay     Decimal  @default(25.00)      // 5% of paper / $1 of live
  allowFutures   Boolean  @default(false)
  allowCrypto    Boolean  @default(true)
  allowStocks    Boolean  @default(true)
  allowOptions   Boolean  @default(false)
  minSignalScore Int      @default(70)
  minRrRatio     Decimal  @default(2.0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model DailyCheckin {
  id              String   @id @default(cuid())
  userId          String
  checkinDate     DateTime @default(now())
  accountSize     Decimal
  isCalm          Boolean
  maxLossToday    Decimal
  hasTime         Boolean
  tradingReason   String   // "setup" | "practice" | "money" | "revenge" | "boredom" | "other"
  shouldTrade     Boolean
  aiRecommendation String? // "trade" | "no_trade" | "reduced"
  aiReasoning     String?
  aiWarnings      String[] @default([])
  createdAt       DateTime @default(now())
}

model MorningBriefing {
  id               String   @id @default(cuid())
  userId           String
  briefingDate     DateTime @default(now())
  marketBias       String   // "bullish" | "bearish" | "neutral" | "no_trade"
  biasReason       String?
  spyChange        Decimal?
  qqqChange        Decimal?
  btcChange        Decimal?
  ethChange        Decimal?
  vixLevel         Decimal?
  volatilityWarn   Boolean  @default(false)
  highImpactNews   String[] @default([])
  noTradeReasons   String[] @default([])
  bestWindow       String?
  topSetupIds      String[] @default([])
  fullBriefing     String?
  createdAt        DateTime @default(now())
}

model Signal {
  id              String   @id @default(cuid())
  userId          String
  scanDate        DateTime @default(now())
  ticker          String
  marketType      String   // "stock" | "crypto" | "futures"
  direction       String   // "long" | "short" | "skip"
  scoreTrend      Int?
  scoreMaAlign    Int?
  scoreSupRes     Int?
  scoreVolume     Int?
  scoreMomentum   Int?
  scoreRsiMacd    Int?
  scoreVwap       Int?
  scoreBreakout   Int?
  scoreNewsRisk   Int?
  scoreVolatility Int?
  scoreRrRatio    Int?
  scoreSession    Int?
  scoreLiquidity  Int?
  totalScore      Int
  grade           String?  // "A" | "B" | "C" | "F"
  aiReasoning     String?
  shouldSkip      Boolean  @default(false)
  skipReason      String?
  TradePlan       TradePlan[]
  createdAt       DateTime @default(now())
}

model TradePlan {
  id             String   @id @default(cuid())
  userId         String
  signalId       String?
  Signal         Signal?  @relation(fields: [signalId], references: [id])
  planDate       DateTime @default(now())
  action         String   // "buy" | "sell" | "no_trade"
  ticker         String
  marketType     String
  bias           String   // "long" | "short"
  entryLow       Decimal?
  entryHigh      Decimal?
  stopLoss       Decimal
  takeProfit1    Decimal
  takeProfit2    Decimal?
  rrRatio        Decimal
  accountSize    Decimal
  riskDollars    Decimal
  positionSize   Decimal
  maxDollarRisk  Decimal
  tradeReason    String
  invalidation   String
  confidenceScore Int
  plainEnglish   String
  passedRiskCheck Boolean @default(false)
  riskViolations String[] @default([])
  userApproved   Boolean?
  approvedAt     DateTime?
  JournalEntry   JournalEntry[]
  createdAt      DateTime @default(now())
}

model JournalEntry {
  id            String   @id @default(cuid())
  userId        String
  tradePlanId   String?
  TradePlan     TradePlan? @relation(fields: [tradePlanId], references: [id])
  entryDate     DateTime @default(now())
  marketType    String
  ticker        String
  strategyName  String?
  entryPrice    Decimal?
  exitPrice     Decimal?
  stopLossUsed  Decimal?
  takeProfitHit String?  // "TP1" | "TP2" | "stopped_out" | "manual_exit"
  positionSize  Decimal?
  pnlDollars    Decimal?
  pnlPercent    Decimal?
  setupScore    Int?
  aiReasoning   String?
  myReasoning   String?
  emotionBefore String?  // "calm" | "anxious" | "excited" | "fearful" | "angry"
  mistakeMade   String?
  lessonLearned String?
  chartNotes    String?
  tradeMode     String   @default("paper")  // "paper" | "live"
  followedPlan  Boolean?
  movedStop     Boolean?
  chasedEntry   Boolean?
  revengeTrade  Boolean?
  createdAt     DateTime @default(now())
}

model Strategy {
  id                String   @id @default(cuid())
  userId            String
  strategyName      String
  sourceNotes       String
  entryRules        String[] @default([])
  exitRules         String[] @default([])
  stopLossRules     String[] @default([])
  takeProfitRules   String[] @default([])
  marketConditions  String[] @default([])
  whenNotToTrade    String[] @default([])
  timeframes        String[] @default([])
  indicators        String[] @default([])
  backtestChecklist String[] @default([])
  paperChecklist    String[] @default([])
  skepticismFlags   String[] @default([])
  aiAssessment      String?
  paperTrades       Int      @default(0)
  paperWinRate      Decimal?
  liveTrades        Int      @default(0)
  liveWinRate       Decimal?
  isActive          Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model EodReview {
  id                 String   @id @default(cuid())
  userId             String
  reviewDate         DateTime @default(now())
  followedPlan       Boolean
  onlyApprovedTrades Boolean
  movedStop          Boolean
  chasedEntries      Boolean
  revengeTrade       Boolean
  respectedLossLimit Boolean
  lessonOfDay        String?
  tomorrowReduced    Boolean  @default(false)
  aiAssessment       String?
  grade              String?  // "A" | "B" | "C" | "D" | "F"
  tradesToday        Int      @default(0)
  pnlToday           Decimal  @default(0)
  createdAt          DateTime @default(now())
}

model RuleViolation {
  id              String   @id @default(cuid())
  userId          String
  violationDate   DateTime @default(now())
  ruleName        String
  ruleDescription String
  context         String?
  tradePlanId     String?
  createdAt       DateTime @default(now())
}
```

## Risk Rules Engine

Create `lib/risk-rules.ts` with these 15 hard rules as TypeScript functions:

```typescript
// All 15 rules — each returns { passed: boolean, message: string }
// RULE_001: Manual approval required (always enforced)
// RULE_002: Max 1% account risk per trade
// RULE_003: Max 2 trades per day
// RULE_004: Stop after 2 losses today
// RULE_005: Daily loss limit (5% of account)
// RULE_006: No averaging down (can't add to losing position)
// RULE_007: Min R:R 2:1
// RULE_008: Min signal score 70
// RULE_009: No high-impact news ±30 min
// RULE_010: No futures overnight (beginner mode)
// RULE_011: No full account risk (max 25% of account per position)
// RULE_012: No options in MVP
// RULE_013: No auto-execution in MVP (always blocked)
// RULE_014: No increasing size after a loss
// RULE_015: Check-in must be completed before trading

export function runAllRules(plan, state, settings): { passed: boolean; violations: string[] }
```

## AI Agent Calls

Create `lib/agents/` with these agent modules:

### `lib/agents/morning-briefing.ts`
- Calls Claude API with market data (SPY%, QQQ%, BTC%, VIX, economic events)
- Returns: marketBias, biasReason, volatilityWarn, noTradeConditions, newsToAvoid, bestWindow, top3Ideas, fullBriefing

### `lib/agents/signal-scorer.ts`
- Scores a ticker 0–100 across 11 weighted components
- Returns all component scores, total, grade, direction, aiReasoning

### `lib/agents/trade-planner.ts`
- Takes signal data + account size → returns full trade plan
- Enforces: R:R ≥ 2:1 required, stop at technical level, 1% risk sizing

### `lib/agents/checkin-evaluator.ts`
- Takes 6 check-in answers → returns: recommendation, reasoning, warnings, maxRiskToday

### `lib/agents/strategy-builder.ts`
- Takes raw strategy notes → returns: objective entry/exit/stop/TP rules, skepticism flags, backtestChecklist

### `lib/agents/eod-review.ts`
- Takes 8 EOD answers + day's trades → returns: grade, assessment, what went well, what to improve, tomorrow recommendation

## API Routes to Build

```
POST /api/checkin           — save daily check-in, return AI recommendation
GET  /api/briefing/today    — fetch or generate today's morning briefing
POST /api/briefing/generate — trigger fresh briefing generation
GET  /api/signals           — list signals for today (with score filter)
POST /api/signals/scan      — run a fresh signal scan
GET  /api/signals/[id]      — get single signal
POST /api/plans             — generate trade plan for a signal
GET  /api/plans/[id]        — get trade plan
PATCH /api/plans/[id]/approve — user approves trade
PATCH /api/plans/[id]/skip    — user skips trade
GET  /api/journal           — list journal entries
POST /api/journal           — create journal entry
GET  /api/journal/[id]      — get single entry
PATCH /api/journal/[id]     — update entry
GET  /api/performance       — calculated stats (win rate, PF, expectancy, etc.)
POST /api/eod               — save EOD review, return AI assessment
GET  /api/strategies        — list user strategies
POST /api/strategies        — create strategy (triggers AI conversion)
GET  /api/settings          — get user settings
PATCH /api/settings         — update settings
```

## Market Data Fetching

Create `lib/market-data.ts`:

```typescript
// Fetch SPY, QQQ, VIX from Yahoo Finance unofficial API
// Endpoint pattern: https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=2d
// Returns: currentPrice, previousClose, changePercent, volume

// Fetch BTC, ETH from CoinGecko free API (no key needed)
// Endpoint: https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true
// Returns: price, 24hChange

// Fetch economic calendar from MarketWatch scraper or Econoday
// Or use a static lookup for known high-impact dates

// Position sizer utility
export function calculatePositionSize(accountSize: number, riskPct: number, entryPrice: number, stopPrice: number): {
  shares: number;
  dollarRisk: number;
  maxPosition: number;
}
```

## UI Component Priority

Build these shadcn components first (they're used everywhere):
- `Badge` — signal grades (A/B/C/F with color coding)
- `Card` — trade plan cards, briefing cards
- `Progress` — signal score bar 0–100
- `Alert` — risk warnings, no-trade conditions
- `Table` — signal scanner, journal list
- `Dialog` — approve/skip confirmation
- `Form` + `Input` + `Select` — all forms

## Color System (Tailwind)

```
Signal Grade A (85+): bg-green-500
Signal Grade B (70-84): bg-blue-500
Signal Grade C (50-69): bg-yellow-500
Signal Grade F (<50): bg-red-500

Market Bias Bullish: text-green-600
Market Bias Bearish: text-red-600
Market Bias Neutral: text-yellow-600
Market Bias No-Trade: text-gray-600

Risk warning: bg-amber-50 border-amber-300 text-amber-800
Rule violation: bg-red-50 border-red-300 text-red-800
```

## Key UX Rules

1. **Default to paper mode** — never show "live" without explicit mode switch
2. **Always show account mode badge** — "PAPER" (blue) or "LIVE $20" (orange) in header
3. **No-trade is celebrated, not hidden** — when no setups qualify, show "✅ Smart call. No trade today." as a positive message
4. **Every trade plan shows the risk check** — all 15 rules listed, green checkmark or red X for each
5. **Approve button requires two clicks** — first click = "Are you sure?", second = confirm
6. **Disclaimer on every page** — small footer: "Signal Guard AI is for educational purposes only. Not financial advice. All trading involves risk."
7. **Dark mode friendly** — use Tailwind dark: variants

## Disclaimer (Required on Every Page Footer)

```
Signal Guard AI is for personal educational and decision-support use only. 
It does not guarantee profits, does not predict markets with certainty, 
and does not place trades automatically. All trade decisions are made by you. 
Trading involves substantial risk of loss. Not financial advice.
```

## What to Build in This Session

Focus on the **Phase 1 MVP core** — get something running:

1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` to scaffold
2. Install deps: `prisma`, `@prisma/client`, `@anthropic-ai/sdk`, `shadcn-ui`, `@clerk/nextjs`, `recharts`
3. Create `prisma/schema.prisma` with all models above
4. Create `src/app/layout.tsx` with ClerkProvider, dark header with "Signal Guard AI" branding + mode badge + nav links
5. Create `src/app/page.tsx` — Morning Brief page with mock data first (static data, real API calls later)
6. Create `src/app/checkin/page.tsx` — 6-question check-in form
7. Create `src/app/scanner/page.tsx` — signal scanner table (mock data with real scores)
8. Create `src/app/plan/[id]/page.tsx` — trade plan card (all fields, risk check, approve/skip)
9. Create `src/app/journal/page.tsx` — journal list
10. Create `src/app/journal/new/page.tsx` — new entry form
11. Create `src/app/performance/page.tsx` — performance dashboard with Recharts
12. Create `src/app/settings/page.tsx` — settings with mode toggle
13. Create `lib/risk-rules.ts` — all 15 rules as TS functions
14. Create `lib/market-data.ts` — Yahoo Finance + CoinGecko fetchers
15. Create API routes for checkin, briefing, signals, plans, journal, performance, settings

Use mock data where real APIs aren't connected yet — label them clearly with a `// TODO: replace with real API` comment.

## After Scaffolding Is Done

Run this to notify:
`openclaw system event --text "Signal Guard AI scaffold complete — ready for review" --mode now`

## Important Constraints

- $20 is the live capital — ALL risk calculations must work at this scale
  - 1% of $20 = $0.20 max risk per live trade
  - Position sizes will often be fractional shares — Robinhood supports this
- Paper mode always uses $500 simulated
- Never hard-code prices or assume asset values
- All monetary values stored as Decimal (not float) in Prisma
- Do NOT implement any auto-trade execution, webhook execution, or broker API calls
- The "approve" button generates a Robinhood checklist — it does NOT place the order
