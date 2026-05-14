import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchMarketOverview, classifyMarketBias, getHighImpactEventsToday } from '@/lib/market-data'
import { generateMorningBriefing } from '@/lib/agents/morning-briefing'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET() {
  try {
    // Return today's briefing if already generated
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.morningBriefing.findFirst({
      where: {
        userId: USER_ID,
        briefingDate: { gte: today },
      },
      orderBy: { briefingDate: 'desc' },
    })

    if (existing) return NextResponse.json({ briefing: existing, fresh: false })

    // Generate fresh briefing from live market data
    const overview = await fetchMarketOverview()
    const { bias, reason, noTradeReasons } = classifyMarketBias(overview)
    const newsEvents = getHighImpactEventsToday()

    // Run Claude agent for intelligent synthesis (falls back to mock if no key)
    const agentOutput = await generateMorningBriefing(overview, bias, noTradeReasons, 20)

    const briefing = await prisma.morningBriefing.create({
      data: {
        userId: USER_ID,
        marketBias: agentOutput.verdict === 'NO_TRADE' ? 'no_trade' : bias,
        biasReason: reason,
        spyChange: overview.spy?.changePercent ?? null,
        qqqChange: overview.qqq?.changePercent ?? null,
        btcChange: overview.btc?.change24h ?? null,
        ethChange: overview.eth?.change24h ?? null,
        vixLevel: overview.vix ?? null,
        volatilityWarn: (overview.vix ?? 0) > 20,
        highImpactNews: newsEvents,
        noTradeReasons,
        bestWindow: '10:00 AM – 11:30 AM ET',
        fullBriefing: [
          `🧠 SIGNAL GUARD AI — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
          `Verdict: ${agentOutput.verdict}`,
          agentOutput.summary,
          agentOutput.marketContext,
          agentOutput.keyRisks.length > 0 ? `Key Risks: ${agentOutput.keyRisks.join(' | ')}` : '',
          agentOutput.rulesReminder,
        ].filter(Boolean).join('\n'),
      },
    })

    return NextResponse.json({ briefing, agentVerdict: agentOutput.verdict, fresh: true })
  } catch (err) {
    console.error('[GET /api/briefing]', err)
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 })
  }
}
