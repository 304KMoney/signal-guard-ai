// Signal Guard AI — Check-In Evaluator Agent
// Evaluates the trader's pre-market mental state check-in.
// Returns GO / CAUTION / BLOCKED verdict with reasoning.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CheckinInput {
  isCalm: boolean
  tradingReason: string
  hasTime: boolean
  maxLossToday: number
  accountSize: number
}

export interface CheckinOutput {
  verdict: 'GO' | 'CAUTION' | 'BLOCKED'
  summary: string
  concerns: string[]
  recommendation: string
}

const BLOCKED_PHRASES = [
  'make money', 'need money', 'bills', 'rent', 'debt', 'desperate',
  'revenge', 'make it back', 'loss', 'bored', 'nothing else',
  'financial pressure', 'stress', 'angry', 'upset',
]

export async function evaluateCheckin(input: CheckinInput): Promise<CheckinOutput> {
  const reasonLower = input.tradingReason.toLowerCase()
  const emotionalFlag = BLOCKED_PHRASES.some(p => reasonLower.includes(p))

  // Hard blocks — no AI needed
  if (!input.isCalm) {
    return {
      verdict: 'BLOCKED',
      summary: 'You are not in a calm state. Trading while emotional leads to rule violations.',
      concerns: ['Not calm — emotional state detected'],
      recommendation: 'Close the app. Come back tomorrow when you are reset.',
    }
  }
  if (emotionalFlag) {
    return {
      verdict: 'BLOCKED',
      summary: 'Your stated reason for trading today contains emotional or financial pressure triggers.',
      concerns: [`Reason flagged: "${input.tradingReason}"`],
      recommendation: 'Do not trade today. Your edge disappears under financial pressure.',
    }
  }
  if (!input.hasTime) {
    return {
      verdict: 'BLOCKED',
      summary: 'You do not have dedicated time to monitor trades. Untended trades violate risk rules.',
      concerns: ['Insufficient time to actively manage positions'],
      recommendation: 'Skip today. Only trade when you can watch the position.',
    }
  }
  if (input.maxLossToday > input.accountSize * 0.05) {
    return {
      verdict: 'CAUTION',
      summary: `Max loss today ($${input.maxLossToday}) exceeds 5% of account. Reduce to $${(input.accountSize * 0.05).toFixed(2)}.`,
      concerns: ['Max loss setting too high'],
      recommendation: `Set max loss to $${(input.accountSize * 0.05).toFixed(2)} or less.`,
    }
  }

  // All green — optionally use Claude for nuanced coaching
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      verdict: 'GO',
      summary: 'You passed the mental state check. Trade with discipline.',
      concerns: [],
      recommendation: 'Review your watchlist. Only take Grade A/B signals. Max 2 trades today.',
    }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 250,
      messages: [{
        role: 'user',
        content: `Signal Guard AI check-in evaluator. Trader passed all hard checks.
Calm: ${input.isCalm}, Reason: "${input.tradingReason}", Has time: ${input.hasTime}
Account: $${input.accountSize}, Max loss today: $${input.maxLossToday}

Give a brief GO coaching message. Return JSON only:
{
  "verdict": "GO",
  "summary": "1 sentence affirming they are ready",
  "concerns": [],
  "recommendation": "1 specific reminder for discipline today"
}`,
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return JSON.parse(text) as CheckinOutput
  } catch {
    return {
      verdict: 'GO',
      summary: 'Mental state check passed. You are cleared to trade.',
      concerns: [],
      recommendation: 'Wait for Grade A/B signals only. Stop after 2 losses.',
    }
  }
}
