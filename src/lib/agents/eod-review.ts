// Signal Guard AI — End-of-Day Review Agent
// Grades the trader's day, identifies rule violations, and sets
// the mindset for tomorrow. Enforces honest self-assessment.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface EodInput {
  tradesCount: number
  wins: number
  losses: number
  totalPnl: number
  followedPlan: boolean
  onlyApprovedTrades: boolean
  movedStop: boolean
  chasedEntries: boolean
  revengeTrade: boolean
  respectedLossLimit: boolean
  notes?: string
}

export interface EodOutput {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number          // 0-100
  summary: string
  violations: string[]
  positives: string[]
  tomorrowFocus: string
  canTradeTomorrow: boolean
  streakWarning?: string
}

export async function reviewDay(input: EodInput): Promise<EodOutput> {
  const violations: string[] = []

  if (!input.followedPlan) violations.push('Did not follow the trade plan')
  if (!input.onlyApprovedTrades) violations.push('Took unapproved trades')
  if (input.movedStop) violations.push('Moved stop-loss after entry')
  if (input.chasedEntries) violations.push('Chased entries (FOMO)')
  if (input.revengeTrade) violations.push('Took revenge trades after a loss')
  if (!input.respectedLossLimit) violations.push('Exceeded daily loss limit')

  // Score calculation
  const baseScore = 100
  const deductions = violations.length * 15
  const bonusWinRate = input.tradesCount > 0 && (input.wins / input.tradesCount) >= 0.5 ? 5 : 0
  const score = Math.max(0, Math.min(100, baseScore - deductions + bonusWinRate))

  const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F'

  // Hard block: revenge trading or exceeded loss limit = no trading tomorrow
  const canTradeTomorrow = !input.revengeTrade && input.respectedLossLimit && violations.length < 4

  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockReview(input, violations, score, grade, canTradeTomorrow)
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Signal Guard AI end-of-day review.

Trades: ${input.tradesCount} (${input.wins}W / ${input.losses}L), P&L: $${input.totalPnl.toFixed(2)}
Rule violations: ${violations.length === 0 ? 'None' : violations.join(', ')}
Discipline score: ${score}/100 (Grade ${grade})
Can trade tomorrow: ${canTradeTomorrow}
${input.notes ? `Trader notes: ${input.notes}` : ''}

Write a brief honest assessment. Be direct, not preachy.
Return ONLY this JSON:
{
  "summary": "2 sentence honest assessment",
  "positives": ["positive1"],
  "tomorrowFocus": "One specific thing to improve tomorrow",
  "streakWarning": "Warning if consecutive losses or violations building up, else null"
}`,
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    return {
      grade,
      score,
      summary: parsed.summary,
      violations,
      positives: parsed.positives ?? [],
      tomorrowFocus: parsed.tomorrowFocus,
      canTradeTomorrow,
      streakWarning: parsed.streakWarning ?? undefined,
    }
  } catch {
    return getMockReview(input, violations, score, grade, canTradeTomorrow)
  }
}

function getMockReview(
  input: EodInput,
  violations: string[],
  score: number,
  grade: 'A' | 'B' | 'C' | 'D' | 'F',
  canTradeTomorrow: boolean,
): EodOutput {
  const winRate = input.tradesCount > 0 ? Math.round((input.wins / input.tradesCount) * 100) : 0
  return {
    grade,
    score,
    summary: violations.length === 0
      ? `Clean day. ${input.tradesCount} trade(s), ${winRate}% win rate, $${input.totalPnl.toFixed(2)} P&L. Rules respected.`
      : `${violations.length} rule violation(s) today. Focus on process over outcome tomorrow.`,
    violations,
    positives: [
      ...(input.followedPlan ? ['Followed the plan'] : []),
      ...(input.respectedLossLimit ? ['Respected daily loss limit'] : []),
      ...(input.wins > 0 ? [`${input.wins} winning trade(s)`] : []),
    ],
    tomorrowFocus: violations.length > 0
      ? `Eliminate: ${violations[0]}`
      : 'Maintain discipline. Wait for Grade A/B signals only.',
    canTradeTomorrow,
    streakWarning: !canTradeTomorrow
      ? 'You cannot trade tomorrow. Review your violations and reset overnight.'
      : undefined,
  }
}
