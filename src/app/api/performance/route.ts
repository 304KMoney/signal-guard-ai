import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: USER_ID,
        pnlDollars: { not: null },
      },
      orderBy: { entryDate: 'asc' },
    })

    const totalTrades = entries.length
    if (totalTrades === 0) {
      return NextResponse.json({
        totalTrades: 0, paperTrades: 0, liveTrades: 0,
        wins: 0, losses: 0, winRate: 0,
        avgWin: 0, avgLoss: 0, profitFactor: 0,
        expectancy: 0, maxDrawdown: 0, totalPnl: 0,
        ruleViolations: 0, noTradeCorrectDays: 0,
        equityCurve: [],
      })
    }

    const wins = entries.filter(e => Number(e.pnlDollars) > 0)
    const losses = entries.filter(e => Number(e.pnlDollars) < 0)
    const paperTrades = entries.filter(e => e.tradeMode === 'paper').length
    const liveTrades = entries.filter(e => e.tradeMode === 'live').length

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0
    const avgWin = wins.length > 0
      ? wins.reduce((s, e) => s + Number(e.pnlDollars), 0) / wins.length
      : 0
    const avgLoss = losses.length > 0
      ? losses.reduce((s, e) => s + Number(e.pnlDollars), 0) / losses.length
      : 0

    const totalWins = wins.reduce((s, e) => s + Number(e.pnlDollars), 0)
    const totalLosses = Math.abs(losses.reduce((s, e) => s + Number(e.pnlDollars), 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

    const expectancy = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss

    // Equity curve + max drawdown
    let runningPnl = 0
    let peak = 0
    let maxDrawdown = 0
    const equityCurve: { date: string; pnl: number }[] = []

    for (const e of entries) {
      runningPnl += Number(e.pnlDollars)
      if (runningPnl > peak) peak = runningPnl
      const dd = peak - runningPnl
      if (dd > maxDrawdown) maxDrawdown = dd
      equityCurve.push({
        date: e.entryDate.toISOString().split('T')[0],
        pnl: Math.round(runningPnl * 100) / 100,
      })
    }

    const ruleViolations = await prisma.ruleViolation.count({ where: { userId: USER_ID } })
    const violationLogs = await prisma.journalEntry.count({
      where: {
        userId: USER_ID,
        OR: [
          { movedStop: true },
          { chasedEntry: true },
          { revengeTrade: true },
          { followedPlan: false },
        ],
      },
    })

    return NextResponse.json({
      totalTrades,
      paperTrades,
      liveTrades,
      wins: wins.length,
      losses: losses.length,
      winRate: Math.round(winRate * 10) / 10,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      totalPnl: Math.round(runningPnl * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      ruleViolations: ruleViolations + violationLogs,
      noTradeCorrectDays: 0, // TODO: track from EOD reviews
      equityCurve,
    })
  } catch (err) {
    console.error('[GET /api/performance]', err)
    return NextResponse.json({ error: 'Failed to compute performance' }, { status: 500 })
  }
}
