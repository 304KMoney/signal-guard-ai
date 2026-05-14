// Signal Guard AI — Performance Dashboard

import { MOCK_PERFORMANCE } from '@/lib/mock-data'
import { formatCurrency, pnlColor } from '@/lib/utils'

export default function PerformancePage() {
  const p = MOCK_PERFORMANCE  // TODO: Replace with real DB query via /api/performance

  const metrics = [
    { label: 'Total Trades', value: p.totalTrades, sub: `${p.paperTrades} paper / ${p.liveTrades} live`, color: 'text-white' },
    { label: 'Win Rate', value: `${p.winRate}%`, sub: `${p.wins}W / ${p.losses}L`, color: p.winRate >= 50 ? 'text-green-400' : 'text-yellow-400' },
    { label: 'Avg Win', value: formatCurrency(p.avgWin), sub: 'per winning trade', color: 'text-green-400' },
    { label: 'Avg Loss', value: formatCurrency(p.avgLoss), sub: 'per losing trade', color: 'text-red-400' },
    { label: 'Profit Factor', value: p.profitFactor.toFixed(2), sub: 'total wins / total losses', color: p.profitFactor >= 1.5 ? 'text-green-400' : p.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400' },
    { label: 'Expectancy', value: formatCurrency(p.expectancy), sub: 'per trade average', color: p.expectancy >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Max Drawdown', value: formatCurrency(p.maxDrawdown), sub: 'worst streak', color: 'text-red-400' },
    { label: 'Total P&L', value: formatCurrency(p.totalPnl), sub: 'all trades combined', color: pnlColor(p.totalPnl) },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📊 Performance Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Track whether the system is actually improving your trading.</p>
      </div>

      {/* Core metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{m.label}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-500 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Win rate bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-4">WIN / LOSS BREAKDOWN</h2>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-green-400 text-sm w-8">{p.wins}W</span>
          <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden flex">
            <div className="bg-green-500 h-4 transition-all" style={{ width: `${p.winRate}%` }} />
            <div className="bg-red-500 h-4 flex-1" />
          </div>
          <span className="text-red-400 text-sm w-8">{p.losses}L</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Win Rate: {p.winRate}%</span>
          <span>Breakeven with 1:2 R:R = 33.3% win rate needed</span>
          <span>Your rate: {p.winRate >= 33.3 ? '✅ Positive Expectancy' : '⚠️ Negative Expectancy'}</span>
        </div>
      </div>

      {/* Expectancy explainer */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-3">📐 EXPECTANCY FORMULA</h2>
        <div className="font-mono text-sm text-gray-300 bg-gray-800 rounded-lg p-4">
          <p>Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss)</p>
          <p className="mt-2 text-blue-400">
            = ({p.winRate / 100} × {formatCurrency(p.avgWin)}) − ({(1 - p.winRate / 100).toFixed(3)} × {formatCurrency(Math.abs(p.avgLoss))})
          </p>
          <p className={`mt-2 font-bold ${p.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            = {formatCurrency(p.expectancy)} per trade
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Positive expectancy means your strategy makes money over many trades. Negative = losing system.
          {p.expectancy >= 0 ? ' ✅ Your current expectancy is positive.' : ' ⚠️ Current system has negative expectancy — review strategy.'}
        </p>
      </div>

      {/* Market + setup performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-400 mb-3">🏆 BEST / WORST MARKETS</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Best Market</span>
              <span className="text-green-400 font-semibold capitalize">{p.bestMarket} ✅</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Worst Market</span>
              <span className="text-red-400 font-semibold capitalize">{p.worstMarket} ⚠️</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-400 mb-3">🛡 DISCIPLINE METRICS</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Rule Violations</span>
              <span className={`font-semibold ${p.ruleViolations === 0 ? 'text-green-400' : 'text-red-400'}`}>{p.ruleViolations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">No-Trade Days (correct call)</span>
              <span className="text-green-400 font-semibold">{p.noTradeCorrectDays} days ✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Is the system improving? */}
      <div className={`border rounded-xl p-5 ${p.expectancy >= 0 && p.profitFactor >= 1.5 ? 'bg-green-950 border-green-800' : 'bg-yellow-950 border-yellow-800'}`}>
        <h2 className="text-sm font-bold mb-2">
          {p.expectancy >= 0 && p.profitFactor >= 1.5 ? '✅ System Assessment: ON TRACK' : '⚠️ System Assessment: NEEDS REVIEW'}
        </h2>
        <div className="space-y-1 text-sm">
          <p className={p.winRate >= 40 ? 'text-green-300' : 'text-yellow-300'}>
            {p.winRate >= 40 ? '✅' : '⚠️'} Win rate {p.winRate}% {p.winRate >= 40 ? '(target: ≥40%)' : '(target: ≥40% — below target)'}
          </p>
          <p className={p.profitFactor >= 1.5 ? 'text-green-300' : 'text-yellow-300'}>
            {p.profitFactor >= 1.5 ? '✅' : '⚠️'} Profit factor {p.profitFactor.toFixed(2)} {p.profitFactor >= 1.5 ? '(target: ≥1.5)' : '(target: ≥1.5 — below target)'}
          </p>
          <p className={p.expectancy >= 0 ? 'text-green-300' : 'text-red-300'}>
            {p.expectancy >= 0 ? '✅' : '❌'} Expectancy {formatCurrency(p.expectancy)}/trade (must be positive)
          </p>
          <p className={p.ruleViolations === 0 ? 'text-green-300' : 'text-yellow-300'}>
            {p.ruleViolations === 0 ? '✅' : '⚠️'} {p.ruleViolations} rule violations (target: 0)
          </p>
        </div>
        <p className="text-gray-400 text-xs mt-3">
          Minimum 30 paper trades needed before drawing conclusions. Currently at {p.totalTrades} trades.
          {p.totalTrades < 30 ? ' Keep building your sample size.' : ' Sample size sufficient for analysis.'}
        </p>
      </div>

      <p className="text-xs text-gray-600 text-center">
        ⚠️ Past performance does not guarantee future results. Data shown is simulated paper trading. Not financial advice.
      </p>
    </div>
  )
}
