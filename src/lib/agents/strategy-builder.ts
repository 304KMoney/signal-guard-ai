// Signal Guard AI — Strategy Builder Agent
// Helps define, refine, and validate a named trading strategy
// against the hard risk rules. Returns a structured strategy card.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface StrategyInput {
  name: string
  description: string
  marketType: 'stock' | 'crypto' | 'both'
  timeframe: string       // e.g. "5m", "15m", "1h", "daily"
  entryLogic: string      // trader's plain-English entry rules
  exitLogic: string
  historicalWinRate?: number
}

export interface StrategyOutput {
  name: string
  grade: 'A' | 'B' | 'C' | 'INVALID'
  summary: string
  strengths: string[]
  gaps: string[]          // missing elements in the strategy definition
  ruleConflicts: string[] // any violations of Signal Guard hard rules
  suggestedImprovements: string[]
  requiredChecks: string[] // what to verify before using this strategy live
}

export async function buildStrategy(input: StrategyInput): Promise<StrategyOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockStrategy(input)
  }

  const prompt = `You are Signal Guard AI strategy builder. Evaluate this trading strategy for a $20 live account.

Strategy Name: ${input.name}
Market: ${input.marketType}
Timeframe: ${input.timeframe}
Description: ${input.description}
Entry Logic: ${input.entryLogic}
Exit Logic: ${input.exitLogic}
${input.historicalWinRate !== undefined ? `Claimed Win Rate: ${input.historicalWinRate}%` : ''}

Hard rules this strategy MUST respect:
- Max 1% risk per trade ($0.20 on $20 account)
- Min R:R 2:1
- Min signal score 70/100
- Max 2 trades per day
- Stop after 2 consecutive losses
- No options, no futures in MVP
- No trading near high-impact news events

Grade the strategy (A=solid, B=decent, C=incomplete, INVALID=violates hard rules).

Return ONLY this JSON:
{
  "name": "${input.name}",
  "grade": "A"|"B"|"C"|"INVALID",
  "summary": "2 sentence assessment",
  "strengths": ["strength1"],
  "gaps": ["gap1"],
  "ruleConflicts": ["conflict if any"],
  "suggestedImprovements": ["improvement1"],
  "requiredChecks": ["check before going live1"]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return JSON.parse(text) as StrategyOutput
  } catch {
    return getMockStrategy(input)
  }
}

function getMockStrategy(input: StrategyInput): StrategyOutput {
  const hasEntry = input.entryLogic.length > 20
  const hasExit = input.exitLogic.length > 20
  const grade = hasEntry && hasExit ? 'B' : 'C'

  return {
    name: input.name,
    grade,
    summary: `${input.name} is a ${input.timeframe} ${input.marketType} strategy. ${hasEntry && hasExit ? 'Entry and exit logic defined.' : 'Incomplete definition — add more detail.'}`,
    strengths: hasEntry ? ['Entry logic specified'] : [],
    gaps: [
      ...(!hasEntry ? ['Entry logic too vague'] : []),
      ...(!hasExit ? ['Exit logic too vague'] : []),
      'No backtesting data provided',
    ],
    ruleConflicts: [],
    suggestedImprovements: [
      'Define specific entry trigger (price level, indicator signal, pattern)',
      'Define stop-loss as a specific price or % below entry',
      'Paper trade 30+ times before going live',
    ],
    requiredChecks: [
      'Paper trade minimum 30 times',
      'Achieve ≥40% win rate and ≥1.5 profit factor in paper mode',
      'Zero rule violations in last 14 days of paper trading',
    ],
  }
}
