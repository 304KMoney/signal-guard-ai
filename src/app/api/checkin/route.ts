import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

// Blocked trading reasons — mirror of the UI logic
const BLOCKED_REASONS = ['money', 'revenge', 'bored', 'boredom', 'make it back', 'financial pressure']

function evaluateCheckin(body: {
  isCalm: boolean
  tradingReason: string
  hasTime: boolean
  maxLossToday: number
  accountSize: number
  shouldTrade: boolean
}): { recommendation: string; reasoning: string; warnings: string[]; blocked: boolean } {
  const warnings: string[] = []
  const reasonLower = body.tradingReason.toLowerCase()
  const isBlockedReason = BLOCKED_REASONS.some(r => reasonLower.includes(r))

  if (isBlockedReason) {
    return {
      recommendation: 'NO_TRADE',
      reasoning: 'Your trading reason indicates emotional motivation. Step away — no trades today.',
      warnings: ['Emotional or financial-pressure trading has a negative expected value over time.'],
      blocked: true,
    }
  }
  if (!body.isCalm) {
    return {
      recommendation: 'NO_TRADE',
      reasoning: 'You reported not being emotionally calm. Trading when stressed leads to rule violations.',
      warnings: ['Come back tomorrow when you are in a better headspace.'],
      blocked: true,
    }
  }
  if (!body.hasTime) {
    return {
      recommendation: 'NO_TRADE',
      reasoning: 'You need time to monitor a trade once entered. No time = no trading today.',
      warnings: ['Unmonitored trades cannot honor stop losses.'],
      blocked: true,
    }
  }
  if (!body.shouldTrade) {
    warnings.push('Your own gut says today should not be a trading day. Trust that instinct.')
    return {
      recommendation: 'PAPER_ONLY',
      reasoning: 'Your check-in suggests this is not the right day. Paper trades only if you want to practice.',
      warnings,
      blocked: false,
    }
  }

  const maxRiskPct = body.maxLossToday / body.accountSize
  if (maxRiskPct < 0.01) {
    warnings.push(`Your max loss tolerance today ($${body.maxLossToday}) is less than 1% of account. Use extreme caution.`)
  }

  return {
    recommendation: 'TRADE',
    reasoning: 'Check-in passed. You are clear to trade today — follow the plan and honor every stop.',
    warnings,
    blocked: false,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const eval_ = evaluateCheckin(body)

    const checkin = await prisma.dailyCheckin.create({
      data: {
        userId: USER_ID,
        accountSize: parseFloat(body.accountSize),
        isCalm: body.isCalm,
        maxLossToday: parseFloat(body.maxLossToday),
        hasTime: body.hasTime,
        tradingReason: body.tradingReason,
        shouldTrade: body.shouldTrade,
        aiRecommendation: eval_.recommendation,
        aiReasoning: eval_.reasoning,
        aiWarnings: eval_.warnings,
      },
    })

    return NextResponse.json({ checkin, evaluation: eval_ }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/checkin]', err)
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return today's check-in if it exists
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkin = await prisma.dailyCheckin.findFirst({
      where: {
        userId: USER_ID,
        checkinDate: { gte: today },
      },
      orderBy: { checkinDate: 'desc' },
    })
    return NextResponse.json({ checkin })
  } catch (err) {
    console.error('[GET /api/checkin]', err)
    return NextResponse.json({ error: 'Failed to load check-in' }, { status: 500 })
  }
}
