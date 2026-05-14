// Signal Guard AI — Trade Planner Agent
// Given a ticker, direction, and account config, Claude builds a complete
// trade plan: entry zone, stop, target, position size, and rationale.

import Anthropic from '@anthropic-ai/sdk'
import { calculatePositionSize, calculateRR } from '@/lib/risk-rules'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface TradePlannerInput {
  ticker: string
  marketType: 'stock' | 'crypto'
  direction: 'long' | 'short'
  currentPrice: number
  signalScore: number
  accountSize: number    // $20 live / $500 paper
  tradingMode: 'paper' | 'tiny_live'
  traderNotes?: string
}

export interface TradePlanOutput {
  ticker: string
  direction: 'long' | 'short'
  entryZone: { low: number; high: number }
  stopLoss: number
  target1: number
  target2?: number
  positionSize: { shares: number; dollarRisk: number }
  rrRatio: number
  rationale: string
  executionNotes: string
  warnings: string[]
}

export async function buildTradePlan(input: TradePlannerInput): Promise<TradePlanOutput> {
  const maxRisk = input.accountSize * 0.01 // 1% rule
  const isPaper = input.tradingMode === 'paper'

  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockPlan(input, maxRisk)
  }

  const prompt = `You are Signal Guard AI trade planner. Build a disciplined trade plan.

Ticker: ${input.ticker} (${input.marketType})
Direction: ${input.direction.toUpperCase()}
Current Price: $${input.currentPrice}
Signal Score: ${input.signalScore}/100
Account Size: $${input.accountSize} (${isPaper ? 'PAPER MODE' : 'LIVE'})
Max Dollar Risk: $${maxRisk.toFixed(2)} (1% rule — HARD LIMIT)
Minimum R:R Required: 2:1
${input.traderNotes ? `Trader Notes: ${input.traderNotes}` : ''}

Build a trade plan using realistic price levels near current price.
For stocks: entry within 0.5-1.5% of current price, stop 1-2% away.
For crypto: entry within 1-3% of current price, stop 2-4% away.

Respond with ONLY this JSON (no markdown):
{
  "entryZone": { "low": <price>, "high": <price> },
  "stopLoss": <price>,
  "target1": <price>,
  "target2": <price or null>,
  "rationale": "2 sentences explaining the plan",
  "executionNotes": "Specific execution instruction (limit order, wait for confirmation, etc.)",
  "warnings": ["warning if any"]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)

    const entry = (parsed.entryZone.low + parsed.entryZone.high) / 2
    const pos = calculatePositionSize(input.accountSize, 0.01, entry, parsed.stopLoss)
    const rr = calculateRR(entry, parsed.stopLoss, parsed.target1, input.direction)

    return {
      ticker: input.ticker,
      direction: input.direction,
      entryZone: parsed.entryZone,
      stopLoss: parsed.stopLoss,
      target1: parsed.target1,
      target2: parsed.target2 ?? undefined,
      positionSize: { shares: pos.sharesRounded, dollarRisk: Number(pos.dollarRisk.toFixed(2)) },
      rrRatio: rr,
      rationale: parsed.rationale,
      executionNotes: parsed.executionNotes,
      warnings: parsed.warnings ?? [],
    }
  } catch {
    return getMockPlan(input, maxRisk)
  }
}

function getMockPlan(input: TradePlannerInput, maxRisk: number): TradePlanOutput {
  const p = input.currentPrice
  const stopPct = input.marketType === 'crypto' ? 0.03 : 0.015
  const targetPct = stopPct * 2.5

  const stop = input.direction === 'long'
    ? Number((p * (1 - stopPct)).toFixed(2))
    : Number((p * (1 + stopPct)).toFixed(2))
  const target = input.direction === 'long'
    ? Number((p * (1 + targetPct)).toFixed(2))
    : Number((p * (1 - targetPct)).toFixed(2))

  const pos = calculatePositionSize(input.accountSize, 0.01, p, stop)
  const rr = calculateRR(p, stop, target, input.direction)

  return {
    ticker: input.ticker,
    direction: input.direction,
    entryZone: { low: Number((p * 0.998).toFixed(2)), high: Number((p * 1.002).toFixed(2)) },
    stopLoss: stop,
    target1: target,
    positionSize: { shares: pos.sharesRounded, dollarRisk: Number(maxRisk.toFixed(2)) },
    rrRatio: rr,
    rationale: `${input.direction === 'long' ? 'Long' : 'Short'} ${input.ticker} near current price with disciplined 1% risk. R:R ${rr}:1.`,
    executionNotes: 'Use limit order at entry zone. Do NOT chase if price runs before entry.',
    warnings: rr < 2 ? ['R:R below 2:1 minimum — consider skipping'] : [],
  }
}
