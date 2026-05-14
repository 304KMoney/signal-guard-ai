'use client'
// Signal Guard AI — Strategy Rule Builder

import { useState } from 'react'

const EXAMPLE = `I learned the "9 EMA bounce" strategy from a YouTube video. 
The trader says it works 85% of the time in trending markets. 
Here's how it works: when price pulls back to the 9 EMA on a 5-minute chart 
and bounces, you buy immediately. He said he makes $500 a day with this.
The stop is just below the 9 EMA. He uses it on any stock.`

export default function StrategyBuilderPage() {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function analyzeStrategy() {
    if (!notes.trim()) return
    setLoading(true)
    // TODO: POST to /api/strategies with notes → Claude converts to objective rules
    // For now, show a realistic mock response to demonstrate the system
    await new Promise(r => setTimeout(r, 2000))
    setResult({
      strategyName: '9 EMA Bounce (5-Min)',
      sourceType: 'youtube',
      entryRules: [
        'Price must be in a confirmed uptrend on the 15-minute chart (higher highs and higher lows)',
        'Price pulls back to within $0.05 of the 9 EMA on the 5-minute chart',
        'Volume on the pullback must be below the 20-period average (declining volume = healthy pullback)',
        'A bullish candle (green close) must form at or above the 9 EMA before entry',
        'Broad market (SPY) must be above its own 9 EMA on the 5-minute chart',
        'Entry on the next candle open after the confirmed bounce candle closes',
      ],
      exitRules: [
        'Scale out 50% at 1:1 risk:reward (target = entry + stop distance)',
        'Move stop to breakeven after first partial exit',
        'Trail remainder using the 9 EMA — exit if price closes a candle below it',
      ],
      stopLossRules: [
        'Stop placed $0.10 below the lowest point of the bounce candle',
        'Never move stop down to give more room — if broken, exit',
        'Maximum stop size: 1% of account (reduce size if stop is wider)',
      ],
      takeProfitRules: [
        'TP1: Distance = 1× stop loss (1:1 minimum)',
        'TP2: Prior high of the day or next key resistance level',
        'Only move to TP2 after stop is at breakeven',
      ],
      marketConditions: [
        'Confirmed trending market (not choppy/sideways)',
        'Above-average volume on the prior directional move',
        'Broad market aligned with trade direction',
        'Best conditions: 10:00 AM – 11:30 AM ET or 1:30 PM – 2:30 PM ET',
      ],
      whenNotToTrade: [
        'Sideways/choppy market — EMA bounces fail frequently',
        'First 30 minutes of market open (9:30–10:00 AM)',
        'Within 30 minutes of a high-impact news event',
        'If the 9 EMA is flat (not sloping) — no directional bias',
        'If the last 2 bounce attempts on this setup failed',
        'VIX above 25',
        'Earnings within 48 hours on this specific stock',
        'After 2 losses on this strategy today',
      ],
      timeframes: ['5-minute (entry/stop/target)', '15-minute (trend confirmation)'],
      indicators: [
        '9 EMA (9-period Exponential Moving Average) — standard calculation',
        'Volume (20-period average for comparison)',
        'SPY 9 EMA (broad market filter)',
      ],
      backtestChecklist: [
        'Find 25 historical examples on TradingView (use paper account or replay mode)',
        'For each setup: record entry, stop, TP1, TP2, result',
        'Only count setups where ALL entry rules were satisfied',
        'Calculate: win rate, average R:R, total P&L',
        'Look for: best time of day, best market conditions, setup failures',
        'Identify: what market conditions caused the strategy to fail most often',
        'Minimum 25 setups before drawing conclusions',
      ],
      paperChecklist: [
        'Take minimum 20 paper trades before using real money',
        'Track every trade in the Signal Guard AI journal',
        'Measure: win rate must be ≥ 40% with ≥ 1.5:1 average R:R before going live',
        'Track: how often does the entry rule trigger but the trade fail quickly?',
        'Grade each trade: did you follow all entry rules exactly?',
      ],
      skepticismFlags: [
        '⚠️ "85% win rate" is unverified — no audited data provided. Most retail strategies with claimed 80%+ win rates fail in real trading.',
        '⚠️ "Works on any stock" is a red flag. Strategy quality varies significantly by market cap, sector, and volatility.',
        '⚠️ "$500/day" claim is based on unknown account size, unknown execution, unknown market conditions.',
        '⚠️ YouTube performance claims are often cherry-picked, back-tested on favorable periods, or simply fabricated.',
        '⚠️ A simple EMA bounce without additional filters has likely been tested to death — edge may be minimal.',
      ],
      aiAssessment: 'The 9 EMA bounce is a real and commonly taught strategy with some legitimate edge in trending markets. However, the version presented has critical gaps: no volume filter, no broad market filter, and "any stock" is not a valid universe. The objective rules above add those missing filters, which significantly improve the strategy\'s probability. The 85% win rate claim is almost certainly exaggerated — realistic expectation for this type of strategy with proper filters is 40–55% win rate with good R:R management. Backtest thoroughly before trusting it with real money.',
    })
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🧠 Strategy Rule Builder</h1>
        <p className="text-gray-400 text-sm mt-1">
          Paste raw notes from any course, YouTube video, or Discord signal.
          The AI converts it into objective, testable rules — and flags any unverified claims.
        </p>
      </div>

      <div className="bg-yellow-950 border border-yellow-700 rounded-xl p-4">
        <p className="text-yellow-400 text-sm font-semibold">⚠️ The AI is a skeptic by design</p>
        <p className="text-yellow-300 text-xs mt-1">
          Any "profitable," "tested," or "guaranteed" claim will be flagged. No strategy gets used live without 20+ paper trades.
          The AI will not blindly trust influencer win rates or course promises.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <label className="text-sm font-bold text-gray-400 block mb-3">
          PASTE YOUR RAW STRATEGY NOTES
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={8}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Paste anything here — YouTube transcript, Discord message, course notes, indicator description..."
        />
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setNotes(EXAMPLE)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Load example →
          </button>
          <button
            onClick={analyzeStrategy}
            disabled={!notes.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? '⚙️ Analyzing...' : '🧠 Convert to Objective Rules →'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{result.strategyName}</h2>
            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded capitalize">{result.sourceType}</span>
          </div>

          {/* Skepticism flags first — most important */}
          {result.skepticismFlags?.length > 0 && (
            <div className="bg-red-950 border border-red-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-red-400 mb-3">🚨 SKEPTICISM FLAGS — UNVERIFIED CLAIMS</h3>
              <ul className="space-y-2">
                {result.skepticismFlags.map((flag: string, i: number) => (
                  <li key={i} className="text-red-300 text-sm">{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Assessment */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-2">AI HONEST ASSESSMENT</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{result.aiAssessment}</p>
          </div>

          {/* Rules grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: '✅ ENTRY RULES', data: result.entryRules, color: 'border-green-800' },
              { title: '🚪 EXIT RULES', data: result.exitRules, color: 'border-blue-800' },
              { title: '🛑 STOP LOSS RULES', data: result.stopLossRules, color: 'border-red-800' },
              { title: '🎯 TAKE PROFIT RULES', data: result.takeProfitRules, color: 'border-green-700' },
              { title: '📋 MARKET CONDITIONS REQUIRED', data: result.marketConditions, color: 'border-gray-700' },
              { title: '🚫 WHEN NOT TO TRADE', data: result.whenNotToTrade, color: 'border-red-900' },
            ].map(section => (
              <div key={section.title} className={`bg-gray-900 border ${section.color} rounded-xl p-5`}>
                <h3 className="text-xs font-bold text-gray-400 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.data?.map((item: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-gray-600 shrink-0">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-yellow-400 mb-3">📋 BACKTEST CHECKLIST</h3>
              <ul className="space-y-2">
                {result.backtestChecklist?.map((item: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-yellow-600 shrink-0">☐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-blue-400 mb-3">📄 PAPER TRADING CHECKLIST</h3>
              <ul className="space-y-2">
                {result.paperChecklist?.map((item: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-blue-600 shrink-0">☐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-red-950 border border-red-900 rounded-xl p-4 text-center">
            <p className="text-red-400 font-bold text-sm">🔒 THIS STRATEGY IS NOT APPROVED FOR LIVE TRADING</p>
            <p className="text-red-300 text-xs mt-1">
              Complete the backtest checklist first. Then take minimum 20 paper trades.
              Win rate ≥ 40% with ≥ 1.5:1 R:R required before any live use.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
