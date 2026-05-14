// Signal Guard AI — Morning Briefing Agent
// Uses Claude to synthesize market data into a plain-English briefing
// with a clear GO / NO-TRADE / CAUTION verdict for the day.

import Anthropic from '@anthropic-ai/sdk'
import { MarketOverview } from '@/lib/market-data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface MorningBriefingOutput {
  verdict: 'GO' | 'CAUTION' | 'NO_TRADE'
  summary: string
  marketContext: string
  focusTickers: string[]
  keyRisks: string[]
  rulesReminder: string
}

export async function generateMorningBriefing(
  overview: MarketOverview,
  bias: string,
  noTradeReasons: string[],
  accountSize: number = 20,
): Promise<MorningBriefingOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockBriefing(bias, noTradeReasons)
  }

  const marketContext = `
SPY: ${overview.spy ? `$${overview.spy.price.toFixed(2)} (${overview.spy.changePercent > 0 ? '+' : ''}${overview.spy.changePercent}%)` : 'unavailable'}
QQQ: ${overview.qqq ? `$${overview.qqq.price.toFixed(2)} (${overview.qqq.changePercent > 0 ? '+' : ''}${overview.qqq.changePercent}%)` : 'unavailable'}
VIX: ${overview.vix ? overview.vix.toFixed(1) : 'unavailable'}
BTC: ${overview.btc ? `$${overview.btc.price.toLocaleString()} (${overview.btc.change24h > 0 ? '+' : ''}${overview.btc.change24h}% 24h)` : 'unavailable'}
ETH: ${overview.eth ? `$${overview.eth.price.toLocaleString()} (${overview.eth.change24h > 0 ? '+' : ''}${overview.eth.change24h}% 24h)` : 'unavailable'}
Market Bias: ${bias.toUpperCase()}
No-Trade Conditions: ${noTradeReasons.length > 0 ? noTradeReasons.join('; ') : 'None'}
Account Size: $${accountSize} (max risk per trade: $${(accountSize * 0.01).toFixed(2)}, max 2 trades/day)
`.trim()

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are Signal Guard AI — a strict trading discipline system for a $${accountSize} account.
Analyze this morning's market data and produce a briefing.

${marketContext}

Respond with a JSON object exactly like this (no markdown, pure JSON):
{
  "verdict": "GO" | "CAUTION" | "NO_TRADE",
  "summary": "2-3 sentence plain English verdict",
  "marketContext": "1 sentence on market conditions",
  "focusTickers": ["TICKER1", "TICKER2"],
  "keyRisks": ["risk 1", "risk 2"],
  "rulesReminder": "One hard rule reminder relevant to today"
}

Rules:
- NO_TRADE if VIX > 30, or both SPY+QQQ down >1.5%
- CAUTION if VIX 20-30 or mixed signals
- GO only when conditions are clear and favorable
- Max 2 trades/day, 1% risk ($${(accountSize * 0.01).toFixed(2)} max loss per trade)
- Min signal score 70/100, min R:R 2:1`,
      },
    ],
  })

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text) as MorningBriefingOutput
    return parsed
  } catch {
    return getMockBriefing(bias, noTradeReasons)
  }
}

function getMockBriefing(bias: string, noTradeReasons: string[]): MorningBriefingOutput {
  const isNoTrade = noTradeReasons.length > 0 || bias === 'no_trade'
  return {
    verdict: isNoTrade ? 'NO_TRADE' : bias === 'bullish' ? 'GO' : 'CAUTION',
    summary: isNoTrade
      ? 'Market conditions do not support trading today. Stay flat and protect your capital.'
      : `Market showing ${bias} bias. Check your watchlist for grade A/B setups with score ≥ 70.`,
    marketContext: `Market bias is ${bias}. ${noTradeReasons[0] ?? 'No major blockers identified.'}`,
    focusTickers: ['BTC', 'ETH', 'NVDA', 'TSLA'],
    keyRisks: isNoTrade ? noTradeReasons : ['Check economic calendar for scheduled news', 'Verify volume before entry'],
    rulesReminder: 'Max $0.20 risk per trade. Stop after 2 losses. No revenge trading.',
  }
}
