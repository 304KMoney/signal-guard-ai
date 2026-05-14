# Signal Guard AI — Setup Checklist

## Prerequisites
- Node.js 18+ (you have v22 ✅)
- A Neon PostgreSQL database (free at neon.tech)
- A Clerk account (free at clerk.com)  
- An Anthropic API key (console.anthropic.com)

---

## Step-by-Step Setup

### 1️⃣ Copy env file
```
Copy-Item .env.example .env.local
```

### 2️⃣ Fill in .env.local

Open `.env.local` and fill in:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   ← From Clerk dashboard
CLERK_SECRET_KEY=sk_test_...                    ← From Clerk dashboard
CLERK_WEBHOOK_SECRET=whsec_...                  ← After setting up webhook
DATABASE_URL=postgresql://...                   ← From Neon dashboard
ANTHROPIC_API_KEY=sk-ant-...                    ← From Anthropic console
```

### 3️⃣ Set up Clerk

1. Create account at clerk.com
2. Create new application
3. Copy publishable + secret keys
4. In Clerk dashboard → Webhooks → Add endpoint:
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Events: `user.created`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

### 4️⃣ Set up Neon DB

1. Create account at neon.tech
2. Create new project
3. Copy the connection string to `DATABASE_URL`

### 5️⃣ Install and migrate

```powershell
# Install dependencies (already done)
"C:\Program Files\nodejs\npm.cmd" install

# Generate Prisma client
"C:\Program Files\nodejs\npx.cmd" prisma generate

# Push schema to database  
"C:\Program Files\nodejs\npx.cmd" prisma db push
```

### 6️⃣ Run locally

```powershell
"C:\Program Files\nodejs\npm.cmd" run dev
```

Visit: http://localhost:3000

---

## 🔑 Anthropic API Key

You can set the API key in two places:
1. `.env.local` as `ANTHROPIC_API_KEY` — used as fallback for all users
2. Dashboard → Settings → Anthropic API Key — per-user override

For MVP, just set it in `.env.local`.

---

## 🚀 Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel --prod
```

Or use the Vercel web UI → Import Project → Add all env vars.

---

## ✅ What's Working (MVP)

- [x] Landing page with dark terminal theme
- [x] Clerk auth (sign up/sign in)
- [x] Dashboard with market bias banner
- [x] Morning check-in form (6 questions) → Claude AI brief
- [x] Signal scanner with CoinGecko live prices (BTC/ETH)
- [x] Trade plan page with position sizing + risk rules
- [x] All 6 risk rules checked (advisory warnings)
- [x] Robinhood execution checklist
- [x] Trade journal (create, view, list)
- [x] AI EOD review (Claude)
- [x] Performance dashboard (win rate, P&L, profit factor)
- [x] Strategy library (create/view rule-based strategies)
- [x] Settings (account size, risk %, trading mode, API key)
- [x] Clerk webhook → user auto-created in DB
- [x] Paper vs Live mode toggle
- [x] All AI outputs have disclaimer

## 🔮 Future Enhancements

- Real Yahoo Finance data for stock signals
- Automated signal scoring via Claude
- Mobile responsive improvements
- Push notifications for market events
- TradingView chart embed
- Consecutive loss tracking from DB
- Strategy performance tracking per trade
