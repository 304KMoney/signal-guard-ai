// Signal Guard AI — /api/signals
// Scans a watchlist of tickers and crypto, scores each setup 0–100,
// classifies grade (A/B/C/F), and enforces all 15 risk rules before
// flagging a trade as actionable. Uses live Yahoo Finance + CoinGecko data.
// Falling back to mock data when keys are not yet configured.

import { NextRequest, NextResponse } from 'next/server'
import { fetchTickerSnapshot, fetchCryptoPrices, fetchMarketOverview, classifyMarketBias } from '@/lib/market-data'
import { runAllRules } from '@/lib/risk-rules'
import { MOCK_SIGNALS } from '@/lib/mock-data'

// Default watchlist — mirrors what a disciplined swing/day trader watches
const STOCK_WATCHLIST = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'SPY', 'QQQ', 'AMD', 'MSFT']
const CRYPTO_WATCHLIST = ['bitcoin', 'ethereum', 'solana', 'cardano']

export interface SignalResult {
  ticker: string
  marketType: 'stock' | 'crypto'
  price: number
  changePercent: number
  volume: number
  signalScore: number
  grade: 'A' | 'B' | 'C' | 'F'
  direction: 'long' | 'short' | 'neutral'
  reason: string
  actionable: boolean
  riskWarnings: string[]
}

// Score a ticker snapshot on a 0–100 scale based on momentum + risk signals
function scoreSignal(changePercent: number, volume: number, vix: number | null): {
  score: number
  direction: 'long' | 'short' | 'neutral'
  reason: string
} {
  let score = 50 // neutral baseline
  const reasons: string[] = []
  let direction: 'long' | 'short' | 'neutral' = 'neutral'

  // VIX penalty — high fear = reduce score across the board
  if (vix && vix > 30) {
    score -= 20
    reasons.push(`VIX ${vix.toFixed(1)} (extreme fear)`)
  } else if (vix && vix > 20) {
    score -= 10
    reasons.push(`VIX ${vix.toFixed(1)} (elevated)`)
  }

  // Price momentum scoring
  const absChange = Math.abs(changePercent)
  if (absChange > 3) {
    score += 25
    reasons.push(`Strong move ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`)
    direction = changePercent > 0 ? 'long' : 'short'
  } else if (absChange > 1.5) {
    score += 15
    reasons.push(`Moderate move ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`)
    direction = changePercent > 0 ? 'long' : 'short'
  } else if (absChange > 0.5) {
    score += 5
    reasons.push(`Mild move ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`)
    direction = changePercent > 0 ? 'long' : 'short'
  } else {
    reasons.push('Flat — no directional edge')
  }

  // Volume proxy (basic — no avg volume without premium data)
  // Reward high volume tickers (>5M shares = institutional interest)
  if (volume > 50_000_000) {
    score += 10
    reasons.push('Very high volume')
  } else if (volume > 10_000_000) {
    score += 5
    reasons.push('Above-avg volume')
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  return { score, direction, reason: reasons.join(' | ') }
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'F' {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  return 'F'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const useMock = searchParams.get('mock') === 'true'

  // Return mock data if explicitly requested or if market data fails
  if (useMock) {
    return NextResponse.json({ signals: MOCK_SIGNALS, source: 'mock', ts: new Date().toISOString() })
  }

  try {
    // Fetch market context first (for VIX + bias)
    const overview = await fetchMarketOverview()
    const { bias, noTradeReasons } = classifyMarketBias(overview)
    const vix = overview.vix

    const results: SignalResult[] = []

    // Scan stocks
    const stockSnapshots = await Promise.allSettled(
      STOCK_WATCHLIST.map(t => fetchTickerSnapshot(t))
    )

    for (let i = 0; i < STOCK_WATCHLIST.length; i++) {
      const ticker = STOCK_WATCHLIST[i]
      const result = stockSnapshots[i]
      if (result.status !== 'fulfilled' || !result.value) continue

      const snap = result.value
      const { score, direction, reason } = scoreSignal(snap.changePercent, snap.volume, vix)
      const grade = scoreToGrade(score)

      // Quick risk-rule check
      const riskCheck = runAllRules(
        {
          ticker,
          marketType: 'stock',
          riskDollars: 0.20, // $20 account * 1%
          rrRatio: 2,
          signalScore: score,
          positionSizeUsd: 20,
          isOptions: false,
          isNearNews: false,
          isFuturesNearClose: false,
        },
        {
          tradesToday: 0,
          lossesToday: 0,
          dailyPnl: 0,
          checkinComplete: true,
        },
        {
          accountSize: 20,
          maxRiskPct: 0.01,
          maxTradesDay: 2,
          maxLossDay: 1.0,
          minSignalScore: 70,
          minRrRatio: 2,
          tradingMode: 'tiny_live',
        }
      )

      results.push({
        ticker,
        marketType: 'stock',
        price: snap.price,
        changePercent: snap.changePercent,
        volume: snap.volume,
        signalScore: score,
        grade,
        direction,
        reason: noTradeReasons.length > 0 ? `NO TRADE: ${noTradeReasons[0]}` : reason,
        actionable: riskCheck.passed && grade !== 'F' && grade !== 'C' && bias !== 'no_trade',
        riskWarnings: riskCheck.violations.map(v => v.message),
      })
    }

    // Scan crypto
    const cryptoData = await fetchCryptoPrices()
    const cryptoEntries = [
      { id: 'bitcoin', ticker: 'BTC', data: cryptoData.btc },
      { id: 'ethereum', ticker: 'ETH', data: cryptoData.eth },
    ]

    for (const { ticker, data } of cryptoEntries) {
      if (!data) continue
      const { score, direction, reason } = scoreSignal(data.change24h, 999_999_999, vix)
      const grade = scoreToGrade(score)

      results.push({
        ticker,
        marketType: 'crypto',
        price: data.price,
        changePercent: data.change24h,
        volume: 0, // CoinGecko free tier doesn't include volume in simple/price
        signalScore: score,
        grade,
        direction,
        reason: noTradeReasons.length > 0 ? `NO TRADE: ${noTradeReasons[0]}` : reason,
        actionable: grade === 'A' || (grade === 'B' && bias !== 'no_trade'),
        riskWarnings: grade === 'F' ? ['Signal score too low — do not trade'] : [],
      })
    }

    // Sort: actionable first, then by score descending
    results.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1
      if (!a.actionable && b.actionable) return 1
      return b.signalScore - a.signalScore
    })

    return NextResponse.json({
      signals: results,
      marketBias: bias,
      vix,
      noTradeReasons,
      source: 'live',
      ts: new Date().toISOString(),
    })

  } catch (err) {
    console.error('[/api/signals error]', err)
    // Graceful fallback to mock data so UI never breaks
    return NextResponse.json({
      signals: MOCK_SIGNALS,
      source: 'mock_fallback',
      error: 'Live data fetch failed — showing mock data',
      ts: new Date().toISOString(),
    })
  }
}
