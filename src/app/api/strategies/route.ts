import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET() {
  try {
    const strategies = await prisma.strategy.findMany({
      where: { userId: USER_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ strategies })
  } catch (err) {
    console.error('[GET /api/strategies]', err)
    return NextResponse.json({ error: 'Failed to load strategies' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // If ANTHROPIC_API_KEY is set, we'd call Claude here to convert raw notes.
    // For now, store the raw notes and return a scaffold.
    const strategy = await prisma.strategy.create({
      data: {
        userId: USER_ID,
        strategyName: body.strategyName ?? 'Unnamed Strategy',
        sourceNotes: body.sourceNotes ?? '',
        entryRules: body.entryRules ?? [],
        exitRules: body.exitRules ?? [],
        stopLossRules: body.stopLossRules ?? [],
        takeProfitRules: body.takeProfitRules ?? [],
        marketConditions: body.marketConditions ?? [],
        whenNotToTrade: body.whenNotToTrade ?? [],
        timeframes: body.timeframes ?? [],
        indicators: body.indicators ?? [],
        skepticismFlags: body.skepticismFlags ?? [],
        aiAssessment: body.aiAssessment,
      },
    })

    return NextResponse.json({ strategy }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/strategies]', err)
    return NextResponse.json({ error: 'Failed to save strategy' }, { status: 500 })
  }
}
