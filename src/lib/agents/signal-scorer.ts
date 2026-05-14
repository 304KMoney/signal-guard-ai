// Signal Guard AI — Signal Scorer Agent
// Uses Claude to deeply score a single trade setup beyond the basic momentum score.
// Returns a 0-100 score with specific factor breakdown and a GO/SKIP verdict.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SignalScorerInput {
  ticker: string
  marketType: 'stock' | 'crypto'
  price: number
  changePercent: number
  volume: number
  vix: number | null
  marketBias: string
  setupNotes?: string // user's own notes on the setup
}

export interface SignalScorerOutput {
  ticker: string
  finalScore: number
  grade: 'A' | 'B' | 'C' | 'F'
  verdict: 'GO' | 'WATCH' | 'SKIP'
  factors: {
    momentum: number      // 0-25
    volume: number        // 0-25
    marketAlignment: number // 0-25
    riskEnvironment: number // 0-25
  }
  strengths: string[]
  weaknesses: string[]
  suggestedAction: string
}

export async function scoreSignal(input: SignalScorerInput): Promise<SignalScorerOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockScore(input)
  }

  const prompt = `You are Signal Guard AI signal scorer. Evaluate this trade setup.

Ticker: ${input.ticker} (${input.marketType})
Price: $${input.price}
Change: ${input.changePercent > 0 ? '+' : ''}${input.changePercent.toFixed(2)}%
Volume: ${input.volume > 0 ? input.volume.toLocaleString() : 'N/A (crypto)'}
VIX: ${input.vix?.toFixed(1) ?? 'N/A'}
Market Bias: ${input.marketBias}
${input.setupNotes ? `Trader Notes: ${input.setupNotes}` : ''}

Account: $20 live. Max risk per trade: $0.20. Min R:R: 2:1. Min score: 70.

Score this setup on 4 factors (0-25 each):
- momentum: price action strength and direction
- volume: confirmation (use change% as proxy if volume N/A)
- marketAlignment: setup direction vs overall market bias
- riskEnvironment: VIX level, news risk, general safety

Respond with ONLY this JSON (no markdown):
{
  "ticker": "${input.ticker}",
  "finalScore": <0-100 integer>,
  "grade": "A"|"B"|"C"|"F",
  "verdict": "GO"|"WATCH"|"SKIP",
  "factors": {
    "momentum": <0-25>,
    "volume": <0-25>,
    "marketAlignment": <0-25>,
    "riskEnvironment": <0-25>
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "suggestedAction": "One sentence on what to do"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',  // fast + cheap for per-ticker scoring
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return JSON.parse(text) as SignalScorerOutput
  } catch {
    return getMockScore(input)
  }
}

function getMockScore(input: SignalScorerInput): SignalScorerOutput {
  const absChange = Math.abs(input.changePercent)
  const momentum = Math.min(25, Math.round(absChange * 5))
  const volume = input.volume > 10_000_000 ? 20 : input.volume > 1_000_000 ? 15 : 10
  const marketAlignment = input.marketBias === 'bullish' && input.changePercent > 0 ? 22 :
                          input.marketBias === 'bearish' && input.changePercent < 0 ? 22 : 12
  const riskEnv = input.vix && input.vix > 30 ? 5 : input.vix && input.vix > 20 ? 15 : 22
  const finalScore = momentum + volume + marketAlignment + riskEnv

  const grade: 'A' | 'B' | 'C' | 'F' =
    finalScore >= 85 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 50 ? 'C' : 'F'

  return {
    ticker: input.ticker,
    finalScore,
    grade,
    verdict: finalScore >= 70 ? 'GO' : finalScore >= 50 ? 'WATCH' : 'SKIP',
    factors: { momentum, volume, marketAlignment, riskEnvironment: riskEnv },
    strengths: absChange > 2 ? ['Strong price momentum'] : ['Moderate move'],
    weaknesses: finalScore < 70 ? ['Below minimum score threshold of 70'] : [],
    suggestedAction: finalScore >= 70
      ? `Monitor ${input.ticker} for entry. Set stop below key level. Max loss $0.20.`
      : `Skip ${input.ticker}. Score ${finalScore} below minimum 70.`,
  }
}
