import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

function gradeEod(body: {
  followedPlan: boolean
  onlyApprovedTrades: boolean
  movedStop: boolean
  chasedEntries: boolean
  revengeTrade: boolean
  respectedLossLimit: boolean
}): { grade: string; assessment: string; tomorrow: string } {
  const violations = [
    !body.followedPlan,
    !body.onlyApprovedTrades,
    body.movedStop,
    body.chasedEntries,
    body.revengeTrade,
    !body.respectedLossLimit,
  ].filter(Boolean).length

  if (body.revengeTrade || !body.respectedLossLimit) {
    return {
      grade: 'F',
      assessment: 'Critical discipline failure. Revenge trading or daily limit blown. Full rest day required.',
      tomorrow: 'REST — No trading tomorrow. Review what went wrong.',
    }
  }
  if (violations === 0) {
    return {
      grade: 'A',
      assessment: 'Perfect discipline. You followed every rule and traded with integrity.',
      tomorrow: 'NORMAL — Proceed normally tomorrow.',
    }
  }
  if (violations === 1) {
    return {
      grade: 'B',
      assessment: 'Good session. One minor deviation — note it and correct it tomorrow.',
      tomorrow: 'NORMAL — Proceed normally. Watch the one area of weakness.',
    }
  }
  if (violations === 2) {
    return {
      grade: 'C',
      assessment: 'Acceptable but showed 2 discipline lapses. Review what triggered each one.',
      tomorrow: 'CAUTION — Trade at half size tomorrow. Prove the discipline is back.',
    }
  }
  if (violations === 3) {
    return {
      grade: 'D',
      assessment: 'Poor discipline today. Multiple rule breaks. This pattern leads to blown accounts.',
      tomorrow: 'REDUCED — Half size maximum. One rule break = stop for the day.',
    }
  }
  return {
    grade: 'F',
    assessment: 'Multiple critical violations. The rules exist to protect you. Review them now.',
    tomorrow: 'REST — One full day off. Re-read the risk rules before trading again.',
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const graded = gradeEod(body)

    const review = await prisma.eodReview.create({
      data: {
        userId: USER_ID,
        followedPlan: body.followedPlan,
        onlyApprovedTrades: body.onlyApprovedTrades,
        movedStop: body.movedStop,
        chasedEntries: body.chasedEntries,
        revengeTrade: body.revengeTrade,
        respectedLossLimit: body.respectedLossLimit,
        lessonOfDay: body.lessonOfDay,
        tomorrowReduced: graded.tomorrow.startsWith('REST') || graded.tomorrow.startsWith('REDUCED'),
        grade: graded.grade,
        aiAssessment: graded.assessment,
        tradesToday: body.tradesToday ?? 0,
        pnlToday: body.pnlToday ?? 0,
      },
    })

    return NextResponse.json({ review, grade: graded }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/eod]', err)
    return NextResponse.json({ error: 'Failed to save EOD review' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const reviews = await prisma.eodReview.findMany({
      where: { userId: USER_ID },
      orderBy: { reviewDate: 'desc' },
      take: 30,
    })
    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('[GET /api/eod]', err)
    return NextResponse.json({ error: 'Failed to load EOD reviews' }, { status: 500 })
  }
}
