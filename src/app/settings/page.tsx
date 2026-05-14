'use client'
// Signal Guard AI — Settings & Guardrails

import { useState } from 'react'

export default function SettingsPage() {
  const [mode, setMode] = useState<'paper' | 'tiny_live'>('paper')
  const [settings, setSettings] = useState({
    accountSize: 500,
    liveCapital: 20,
    maxRiskPct: 1,
    maxTradesDay: 2,
    minSignalScore: 70,
    minRrRatio: 2.0,
    allowCrypto: true,
    allowStocks: true,
    allowFutures: false,
    allowOptions: false,
  })
  const [saved, setSaved] = useState(false)

  function save() {
    // TODO: POST to /api/settings
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const maxDollarRisk = (mode === 'paper' ? settings.accountSize : settings.liveCapital) * (settings.maxRiskPct / 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">⚙️ Settings & Guardrails</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your risk limits. These are your guardrails — not suggestions.</p>
      </div>

      {/* Mode switch */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-4">TRADING MODE</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('paper')}
            className={`py-4 rounded-xl border-2 transition-all ${mode === 'paper' ? 'border-blue-500 bg-blue-900/40 text-blue-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}
          >
            <div className="text-2xl mb-1">📄</div>
            <div className="font-bold">Paper Mode</div>
            <div className="text-xs opacity-75 mt-1">Simulated trades only. No real money.</div>
          </button>
          <button
            onClick={() => setMode('tiny_live')}
            className={`py-4 rounded-xl border-2 transition-all ${mode === 'tiny_live' ? 'border-orange-500 bg-orange-900/40 text-orange-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}
          >
            <div className="text-2xl mb-1">💰</div>
            <div className="font-bold">Tiny Live Mode</div>
            <div className="text-xs opacity-75 mt-1">Real money. Manual approval. $20 max.</div>
          </button>
        </div>
        {mode === 'tiny_live' && (
          <div className="mt-4 bg-orange-950 border border-orange-800 rounded-lg p-4">
            <p className="text-orange-400 font-bold text-sm">⚠️ LIVE MODE WARNING</p>
            <p className="text-orange-300 text-xs mt-1">
              You are about to use real money. Signal Guard AI NEVER places trades automatically.
              All execution is manual via Robinhood. 1% risk rule is strictly enforced.
              With $20 live capital, max risk per trade = $0.20.
            </p>
          </div>
        )}
      </div>

      {/* Account settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-400">ACCOUNT SETTINGS</h2>
        {mode === 'paper' ? (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Account Size (simulated)</label>
            <input
              type="number"
              value={settings.accountSize}
              onChange={e => setSettings(s => ({ ...s, accountSize: Number(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Live Capital ($20 starting)</label>
            <input
              type="number"
              value={settings.liveCapital}
              onChange={e => setSettings(s => ({ ...s, liveCapital: Math.min(50, Number(e.target.value)) }))}
              max={50}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Capped at $50 in Tiny Live mode for your protection.</p>
          </div>
        )}
      </div>

      {/* Risk rules */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-400">RISK RULES</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Max Risk Per Trade (%)</label>
              <span className="text-blue-400 text-sm font-bold">{settings.maxRiskPct}% = {maxDollarRisk < 1 ? `$${maxDollarRisk.toFixed(2)}` : `$${maxDollarRisk.toFixed(2)}`} max risk</span>
            </div>
            <input
              type="range" min={0.5} max={2} step={0.25}
              value={settings.maxRiskPct}
              onChange={e => setSettings(s => ({ ...s, maxRiskPct: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0.5% (very conservative)</span>
              <span>2% (maximum)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Max Trades Per Day</label>
              <span className="text-blue-400 text-sm font-bold">{settings.maxTradesDay} trades</span>
            </div>
            <input
              type="range" min={1} max={3} step={1}
              value={settings.maxTradesDay}
              onChange={e => setSettings(s => ({ ...s, maxTradesDay: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Minimum Signal Score</label>
              <span className="text-blue-400 text-sm font-bold">{settings.minSignalScore} / 100</span>
            </div>
            <input
              type="range" min={60} max={85} step={5}
              value={settings.minSignalScore}
              onChange={e => setSettings(s => ({ ...s, minSignalScore: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>60 (more trades)</span>
              <span>85 (A-grade only)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Minimum Risk:Reward Ratio</label>
              <span className="text-blue-400 text-sm font-bold">1:{settings.minRrRatio}</span>
            </div>
            <input
              type="range" min={1.5} max={3} step={0.5}
              value={settings.minRrRatio}
              onChange={e => setSettings(s => ({ ...s, minRrRatio: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Market permissions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-4">ALLOWED MARKETS</h2>
        <div className="space-y-3">
          {[
            { label: '📈 Stocks & ETFs', key: 'allowStocks', note: 'SPY, QQQ, AAPL, etc.' },
            { label: '₿ Crypto', key: 'allowCrypto', note: 'BTC, ETH on Robinhood. No PDT rule.' },
            { label: '📉 Futures', key: 'allowFutures', note: 'ES, NQ, MES, MNQ. Separate account required.' },
            { label: '🔴 Options', key: 'allowOptions', note: 'Disabled in MVP. Not available.' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">{item.label}</div>
                <div className="text-xs text-gray-500">{item.note}</div>
              </div>
              <button
                disabled={item.key === 'allowOptions'}
                onClick={() => setSettings(s => ({ ...s, [item.key]: !(s as any)[item.key] }))}
                className={`w-12 h-6 rounded-full transition-colors ${(settings as any)[item.key] && item.key !== 'allowOptions' ? 'bg-blue-600' : 'bg-gray-700'} ${item.key === 'allowOptions' ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${(settings as any)[item.key] && item.key !== 'allowOptions' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hard rules reminder */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-3">🔒 HARD RULES (CANNOT BE DISABLED)</h2>
        <ul className="space-y-1 text-xs text-gray-400">
          {[
            'No auto-execution — ever',
            'Manual approval required for every trade',
            'Stop after 2 losing trades in one day',
            'Daily loss limit enforced (5% of account)',
            'No averaging down',
            'No revenge trading',
            'No overnight futures (beginner mode)',
            'No options in MVP',
            'No full account trades',
          ].map((rule, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-gray-600">🔒</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={save}
        className={`w-full font-bold py-4 rounded-xl transition-colors text-lg ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        {saved ? '✅ Saved!' : '💾 Save Settings'}
      </button>
    </div>
  )
}
