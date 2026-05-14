import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
    const skip = parseInt(searchParams.get('skip') ?? '0')
    const mode = searchParams.get('mode') // 'paper' | 'live' | null (all)

    const where = {
      userId: USER_ID,
      ...(mode ? { tradeMode: mode } : {}),
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        take: limit,
        skip,
      }),
      prisma.journalEntry.count({ where }),
    ])

    return NextResponse.json({ entries, total, limit, skip })
  } catch (err) {
    console.error('[GET /api/journal]', err)
    return NextResponse.json({ error: 'Failed to load journal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entry = await prisma.journalEntry.create({
      data: {
        userId: USER_ID,
        ticker: body.ticker,
        marketType: body.marketType,
        tradeMode: body.tradeMode ?? 'paper',
        strategyName: body.strategyName,
        entryPrice: body.entryPrice ? parseFloat(body.entryPrice) : null,
        exitPrice: body.exitPrice ? parseFloat(body.exitPrice) : null,
        stopLossUsed: body.stopLossUsed ? parseFloat(body.stopLossUsed) : null,
        takeProfitHit: body.takeProfitHit,
        positionSize: body.positionSize ? parseFloat(body.positionSize) : null,
        pnlDollars: body.pnlDollars ? parseFloat(body.pnlDollars) : null,
        pnlPercent: body.pnlPercent ? parseFloat(body.pnlPercent) : null,
        setupScore: body.setupScore ? parseInt(body.setupScore) : null,
        emotionBefore: body.emotionBefore,
        myReasoning: body.myReasoning,
        aiReasoning: body.aiReasoning,
        mistakeMade: body.mistakeMade,
        lessonLearned: body.lessonLearned,
        chartNotes: body.chartNotes,
        followedPlan: body.followedPlan ?? null,
        movedStop: body.movedStop ?? null,
        chasedEntry: body.chasedEntry ?? null,
        revengeTrade: body.revengeTrade ?? null,
        tradePlanId: body.tradePlanId ?? null,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[POST /api/journal]', err)
    return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
  }
}
