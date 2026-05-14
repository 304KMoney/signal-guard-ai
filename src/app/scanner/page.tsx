// Signal Guard AI — Signal Scanner Page

import { MOCK_SIGNALS } from '@/lib/mock-data'
import { gradeColor, scoreColor, formatPercent } from '@/lib/utils'
import Link from 'next/link'

export default function ScannerPage() {
  const signals = MOCK_SIGNALS  // TODO: Replace with real signal scan API call

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🔍 Signal Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">Setups scored 0–100. Only trade ≥ 70. Only Grade A/B qualify.</p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
          📄 Mock data — connect API keys for live scanning
        </div>
      </div>

      {/* Score legend */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Grade A: 85–100', desc: 'High-quality — proceed to plan', color: 'bg-green-900/40 border-green-800 text-green-400' },
          { label: 'Grade B: 70–84', desc: 'Watchlist — proceed with caution', color: 'bg-blue-900/40 border-blue-800 text-blue-400' },
          { label: 'Grade C: 50–69', desc: 'Weak — paper only at best', color: 'bg-yellow-900/40 border-yellow-800 text-yellow-400' },
          { label: 'Grade F: <50', desc: 'Do not trade', color: 'bg-red-900/40 border-red-800 text-red-400' },
        ].map(item => (
          <div key={item.label} className={`border rounded-lg p-3 ${item.color}`}>
            <div className="font-bold text-sm">{item.label}</div>
            <div className="text-xs opacity-75 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Scanner table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Ticker</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Market</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Direction</th>
              <th className="text-center px-5 py-3 text-gray-400 font-medium">Score</th>
              <th className="text-center px-5 py-3 text-gray-400 font-medium">Grade</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Reasoning</th>
              <th className="text-center px-5 py-3 text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {signals.map(signal => (
              <tr key={signal.id} className={`transition-colors ${signal.shouldSkip ? 'opacity-50' : 'hover:bg-gray-800/50'}`}>
                <td className="px-5 py-4">
                  <span className="font-bold text-white">{signal.ticker}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-400 capitalize bg-gray-800 px-2 py-1 rounded">{signal.marketType}</span>
                </td>
                <td className="px-5 py-4">
                  {signal.direction === 'skip' ? (
                    <span className="text-gray-500 text-xs">—</span>
                  ) : (
                    <span className={`font-semibold text-xs uppercase ${signal.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.direction === 'long' ? '⬆ LONG' : '⬇ SHORT'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xl font-bold ${scoreColor(signal.totalScore)}`}>{signal.totalScore}</span>
                    {/* Mini score bar */}
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${signal.totalScore >= 85 ? 'bg-green-500' : signal.totalScore >= 70 ? 'bg-blue-500' : signal.totalScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${signal.totalScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${gradeColor(signal.grade ?? 'F')}`}>
                    {signal.grade}
                  </span>
                </td>
                <td className="px-5 py-4 max-w-xs">
                  <p className="text-xs text-gray-400 line-clamp-2">{signal.aiReasoning}</p>
                  {signal.shouldSkip && (
                    <p className="text-xs text-red-400 mt-1">🚫 {signal.skipReason}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-center">
                  {signal.shouldSkip || signal.totalScore < 70 ? (
                    <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded">SKIP</span>
                  ) : (
                    <Link
                      href={`/plan?signal=${signal.id}`}
                      className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Plan →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score breakdown for top signal */}
      {signals.filter(s => !s.shouldSkip && s.totalScore >= 70)[0] && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-400 mb-4">
            📐 SCORE BREAKDOWN — {signals.filter(s => !s.shouldSkip && s.totalScore >= 70)[0].ticker}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', key: 'scoreTrend' },
              { label: 'MA Alignment', key: 'scoreMaAlign' },
              { label: 'Support/Res', key: 'scoreSupRes' },
              { label: 'Volume', key: 'scoreVolume' },
              { label: 'Momentum', key: 'scoreMomentum' },
              { label: 'RSI/MACD', key: 'scoreRsiMacd' },
              { label: 'VWAP', key: 'scoreVwap' },
              { label: 'Breakout', key: 'scoreBreakout' },
              { label: 'News Risk', key: 'scoreNewsRisk' },
              { label: 'Volatility', key: 'scoreVolatility' },
              { label: 'R:R Ratio', key: 'scoreRrRatio' },
            ].map(({ label, key }) => {
              const sig = signals.filter(s => !s.shouldSkip && s.totalScore >= 70)[0] as any
              const val = sig[key] ?? 0
              return (
                <div key={label} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${val >= 8 ? 'bg-green-500' : val >= 6 ? 'bg-blue-500' : val >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${val * 10}%` }} />
                    </div>
                    <span className={`text-sm font-bold w-4 ${val >= 8 ? 'text-green-400' : val >= 6 ? 'text-blue-400' : val >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {val}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        ⚠️ Signal scores are AI-generated estimates for educational purposes. Not financial advice. Always use your own judgment.
      </p>
    </div>
  )
}
