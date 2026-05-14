// Signal Guard AI — Morning Brief Page
// TODO: Replace MOCK_BRIEFING and MOCK_SIGNALS with real API calls when keys are configured

import { MOCK_BRIEFING, MOCK_SIGNALS } from '@/lib/mock-data'
import { formatPercent, biasColor, biasEmoji, changeColor, gradeColor, scoreColor } from '@/lib/utils'
import Link from 'next/link'

export default function MorningBriefPage() {
  const briefing = MOCK_BRIEFING
  const signals = MOCK_SIGNALS.filter(s => !s.shouldSkip).slice(0, 3)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🌅 Morning Brief</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </div>
        <Link
          href="/checkin"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Start Daily Check-In →
        </Link>
      </div>

      {/* Market Bias Banner */}
      <div className={`rounded-xl p-5 border ${
        briefing.marketBias === 'bullish' ? 'bg-green-950 border-green-800' :
        briefing.marketBias === 'bearish' ? 'bg-red-950 border-red-800' :
        briefing.marketBias === 'no_trade' ? 'bg-gray-900 border-gray-700' :
        'bg-yellow-950 border-yellow-800'
      }`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{biasEmoji(briefing.marketBias)}</span>
          <div>
            <div className={`text-xl font-bold uppercase ${biasColor(briefing.marketBias)}`}>
              {briefing.marketBias === 'no_trade' ? '🚫 NO TRADE TODAY' : `Market Bias: ${briefing.marketBias.toUpperCase()}`}
            </div>
            <p className="text-gray-300 text-sm mt-1">{briefing.biasReason}</p>
          </div>
        </div>
      </div>

      {/* Market Snapshot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'SPY', value: '$742.41', change: briefing.spyChange },
          { label: 'QQQ', value: '$714.71', change: briefing.qqqChange },
          { label: 'BTC', value: '$80,473', change: briefing.btcChange },
          { label: 'ETH', value: '$2,290', change: briefing.ethChange },
          { label: 'VIX', value: briefing.vixLevel?.toFixed(2) ?? '—', change: null, vix: briefing.vixLevel },
        ].map((item) => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs font-semibold mb-1">{item.label}</div>
            <div className="text-white font-bold">{item.value}</div>
            {item.change !== null && item.change !== undefined ? (
              <div className={`text-sm font-semibold ${changeColor(item.change)}`}>
                {formatPercent(item.change)}
              </div>
            ) : (
              <div className={`text-sm font-semibold ${
                (item.vix ?? 0) > 30 ? 'text-red-400' :
                (item.vix ?? 0) > 20 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {(item.vix ?? 0) > 30 ? '🔴 HIGH' : (item.vix ?? 0) > 20 ? '🟡 ELEVATED' : '🟢 NORMAL'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* News to avoid */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-yellow-400 mb-3">⚠️ NEWS / EVENTS TO WATCH</h2>
          <ul className="space-y-2">
            {briefing.highImpactNews.map((event, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-yellow-400 shrink-0">•</span>
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Session info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-blue-400 mb-3">🕐 TRADING SESSION</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Best Window</span>
              <span className="text-green-400 font-semibold text-sm">{briefing.bestWindow}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avoid Open</span>
              <span className="text-yellow-400 text-sm">9:30 – 10:00 AM ET</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avoid Close</span>
              <span className="text-yellow-400 text-sm">3:30 – 4:00 PM ET</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Volatility</span>
              <span className={briefing.volatilityWarn ? 'text-red-400 text-sm' : 'text-green-400 text-sm'}>
                {briefing.volatilityWarn ? '⚠️ Elevated' : '✅ Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Setups */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">🎯 TOP SETUPS TODAY</h2>
        {briefing.marketBias === 'no_trade' ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🚫</p>
            <p className="text-gray-300 font-semibold">No Trade Today</p>
            <p className="text-gray-500 text-sm mt-1">Conditions do not support trading. Staying flat is the right call.</p>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-300 font-semibold">No qualifying setups today</p>
            <p className="text-gray-500 text-sm mt-1">No signals scored ≥ 70/100. Smart call — no trade today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal, idx) => (
              <div key={signal.id} className="flex items-center gap-4 bg-gray-800 rounded-lg p-4">
                <span className="text-gray-500 text-sm w-4">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{signal.ticker}</span>
                    <span className="text-xs text-gray-400 capitalize">{signal.marketType}</span>
                    <span className={`text-xs font-semibold uppercase ${signal.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.direction}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{signal.aiReasoning}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${scoreColor(signal.totalScore)}`}>{signal.totalScore}</div>
                    <div className="text-xs text-gray-500">score</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${gradeColor(signal.grade ?? 'F')}`}>
                    {signal.grade}
                  </span>
                  <Link
                    href={`/plan?signal=${signal.id}`}
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Plan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Briefing */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-3">📝 FULL BRIEFING</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{briefing.fullBriefing}</p>
        <p className="text-xs text-gray-600 mt-3">
          ⚠️ AI-generated briefing for educational purposes only. Not financial advice. Data may be delayed.
        </p>
      </div>

      {/* No-trade conditions */}
      {briefing.noTradeReasons.length > 0 && (
        <div className="bg-red-950 border border-red-900 rounded-xl p-5">
          <h2 className="text-sm font-bold text-red-400 mb-3">🛑 NO-TRADE CONDITIONS ACTIVE</h2>
          <ul className="space-y-1">
            {briefing.noTradeReasons.map((r, i) => (
              <li key={i} className="text-red-300 text-sm">• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
