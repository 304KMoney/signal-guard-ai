// Signal Guard AI — Trade Journal Page

import { MOCK_JOURNAL_ENTRIES } from '@/lib/mock-data'
import { formatCurrency, pnlColor, gradeColor } from '@/lib/utils'
import Link from 'next/link'

export default function JournalPage() {
  const entries = MOCK_JOURNAL_ENTRIES  // TODO: Replace with DB query

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📓 Trade Journal</h1>
          <p className="text-gray-400 text-sm mt-1">Every trade. Every lesson. Paper and live.</p>
        </div>
        <Link href="/journal/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">📓</p>
          <p className="text-gray-300 font-semibold">No journal entries yet</p>
          <p className="text-gray-500 text-sm mt-2">After each trade (paper or live), log it here. This is how you improve.</p>
          <Link href="/journal/new" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition-colors">
            Add First Entry →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">{entry.ticker}</span>
                      <span className="text-xs text-gray-400 capitalize bg-gray-800 px-2 py-1 rounded">{entry.marketType}</span>
                      <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded capitalize">{entry.tradeMode}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(entry.entryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      {entry.strategyName && ` · ${entry.strategyName}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${pnlColor(entry.pnlDollars ?? 0)}`}>
                    {(entry.pnlDollars ?? 0) >= 0 ? '+' : ''}{formatCurrency(entry.pnlDollars ?? 0)}
                  </div>
                  <div className={`text-xs ${pnlColor(entry.pnlPercent ?? 0)}`}>
                    {(entry.pnlPercent ?? 0) >= 0 ? '+' : ''}{(entry.pnlPercent ?? 0).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {[
                  { label: 'Entry', value: entry.entryPrice ? `$${entry.entryPrice}` : '—' },
                  { label: 'Exit', value: entry.exitPrice ? `$${entry.exitPrice}` : '—' },
                  { label: 'Stop', value: entry.stopLossUsed ? `$${entry.stopLossUsed}` : '—' },
                  { label: 'Exit Type', value: entry.takeProfitHit ?? '—' },
                  { label: 'Size', value: entry.positionSize ? `${entry.positionSize} shares` : '—' },
                  { label: 'Score', value: entry.setupScore ? `${entry.setupScore}/100` : '—' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-800 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm text-white font-medium">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {entry.myReasoning && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">My Reasoning</div>
                    <p className="text-gray-300 text-sm">{entry.myReasoning}</p>
                  </div>
                )}
                {entry.lessonLearned && (
                  <div>
                    <div className="text-xs text-green-400 mb-1">💡 Lesson Learned</div>
                    <p className="text-gray-300 text-sm">{entry.lessonLearned}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className={`flex items-center gap-1 ${entry.emotionBefore === 'calm' ? 'text-green-400' : 'text-yellow-400'}`}>
                  😐 {entry.emotionBefore ?? 'N/A'}
                </span>
                <span className={entry.followedPlan ? 'text-green-400' : 'text-red-400'}>
                  {entry.followedPlan ? '✅ Followed plan' : '❌ Deviated from plan'}
                </span>
                {entry.movedStop && <span className="text-red-400">⚠️ Moved stop</span>}
                {entry.chasedEntry && <span className="text-red-400">⚠️ Chased entry</span>}
                {entry.revengeTrade && <span className="text-red-400">🚨 Revenge trade</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
