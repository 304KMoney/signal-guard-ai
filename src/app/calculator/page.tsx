'use client'
// Signal Guard AI — Position Size / Risk Calculator

import { useState } from 'react'
import { calculatePositionSize, calculateRR } from '@/lib/risk-rules'
import { formatCurrency } from '@/lib/utils'

export default function CalculatorPage() {
  const [mode, setMode] = useState<'paper' | 'live'>('paper')
  const [form, setForm] = useState({
    accountSize: 500,
    riskPct: 1,
    entryPrice: '',
    stopPrice: '',
    tp1Price: '',
    tp2Price: '',
    direction: 'long' as 'long' | 'short',
  })

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const entry = Number(form.entryPrice)
  const stop = Number(form.stopPrice)
  const tp1 = Number(form.tp1Price)
  const tp2 = Number(form.tp2Price)
  const account = mode === 'live' ? 20 : form.accountSize

  const sizing = entry && stop ? calculatePositionSize(account, form.riskPct / 100, entry, stop) : null
  const rr1 = entry && stop && tp1 ? calculateRR(entry, stop, tp1, form.direction) : null
  const rr2 = entry && stop && tp2 ? calculateRR(entry, stop, tp2, form.direction) : null

  const meetsMinRR = rr1 ? rr1 >= 2.0 : null
  const meetsMinScore = true  // calculator doesn't know score

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">⚖️ Risk / Position Size Calculator</h1>
        <p className="text-gray-400 text-sm mt-1">Always calculate size from risk, never from "how much I want to make."</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-3">
        {(['paper', 'live'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); set('accountSize', m === 'live' ? 20 : 500) }}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${mode === m ? (m === 'live' ? 'bg-orange-700 text-white' : 'bg-blue-700 text-white') : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {m === 'paper' ? '📄 Paper ($500)' : '💰 Live ($20)'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        {mode === 'paper' && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Account Size ($)</label>
            <input type="number" value={form.accountSize} onChange={e => set('accountSize', Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        )}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-400">Risk Per Trade (%)</label>
            <span className="text-blue-400 text-sm font-bold">{form.riskPct}% = {formatCurrency(account * form.riskPct / 100)}</span>
          </div>
          <input type="range" min={0.5} max={2} step={0.25} value={form.riskPct} onChange={e => set('riskPct', Number(e.target.value))}
            className="w-full accent-blue-500" />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            {(['long', 'short'] as const).map(d => (
              <button key={d} onClick={() => set('direction', d)}
                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${form.direction === d ? (d === 'long' ? 'bg-green-700 text-white' : 'bg-red-700 text-white') : 'bg-gray-800 text-gray-400'}`}>
                {d === 'long' ? '⬆ Long' : '⬇ Short'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '📍 Entry Price', field: 'entryPrice', placeholder: '184.75' },
            { label: '🛑 Stop Loss', field: 'stopPrice', placeholder: '183.10' },
            { label: '🎯 Take Profit 1', field: 'tp1Price', placeholder: '187.50' },
            { label: '🎯 Take Profit 2', field: 'tp2Price', placeholder: '190.00' },
          ].map(item => (
            <div key={item.field}>
              <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
              <input type="number" step="0.01" value={(form as any)[item.field]} onChange={e => set(item.field, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder={item.placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {sizing && entry && stop && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-400">RESULTS</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Account Size', value: formatCurrency(account) },
              { label: 'Max Dollar Risk', value: formatCurrency(account * form.riskPct / 100), highlight: true },
              { label: 'Stop Distance', value: formatCurrency(Math.abs(entry - stop)) },
              { label: 'Shares / Units', value: `${sizing.sharesRounded}`, highlight: true },
              { label: 'Actual Dollar Risk', value: formatCurrency(sizing.dollarRisk) },
              ...(rr1 ? [{ label: 'R:R to TP1', value: `1:${rr1}`, highlight: true, warn: rr1 < 2 }] : []),
              ...(rr2 ? [{ label: 'R:R to TP2', value: `1:${rr2}` }] : []),
              ...(tp1 && sizing ? [{ label: 'Profit at TP1', value: formatCurrency(sizing.sharesRounded * Math.abs(tp1 - entry)) }] : []),
              ...(tp2 && sizing ? [{ label: 'Profit at TP2', value: formatCurrency(sizing.sharesRounded * Math.abs(tp2 - entry)) }] : []),
            ].map((item: any, i) => (
              <div key={i} className={`rounded-lg p-3 ${item.highlight ? 'bg-blue-900/30 border border-blue-800' : 'bg-gray-800'}`}>
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className={`font-bold ${item.warn ? 'text-red-400' : item.highlight ? 'text-blue-300' : 'text-white'}`}>
                  {item.value}
                  {item.warn && <span className="text-red-400 text-xs ml-1">❌ below 1:2 min</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Rule checks */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            {[
              { label: 'Dollar risk ≤ 1% limit', passed: sizing.dollarRisk <= account * 0.01 + 0.01 },
              { label: 'R:R ≥ 2:1', passed: rr1 ? rr1 >= 2 : false },
              { label: 'Position size ≤ 25% of account', passed: sizing.sharesRounded * entry <= account * 0.25 },
            ].map(rule => (
              <div key={rule.label} className={`flex items-center gap-2 text-sm ${rule.passed ? 'text-green-400' : 'text-red-400'}`}>
                <span>{rule.passed ? '✅' : '❌'}</span>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education box */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-3">📐 HOW POSITION SIZING WORKS</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p><span className="text-white">Step 1:</span> Decide max loss = 1% of account</p>
          <p><span className="text-white">Step 2:</span> Calculate stop distance = |entry − stop|</p>
          <p><span className="text-white">Step 3:</span> Shares = max loss ÷ stop distance</p>
          <p className="font-mono text-blue-400 bg-gray-800 rounded p-2 text-xs mt-2">
            Example (paper): $500 × 1% = $5 risk<br/>
            Stop distance = $184.75 − $183.10 = $1.65<br/>
            Shares = $5.00 ÷ $1.65 = 3.03 → 3 shares<br/>
            Actual risk = 3 × $1.65 = $4.95 ✅
          </p>
          <p className="font-mono text-orange-400 bg-gray-800 rounded p-2 text-xs mt-2">
            Example (live $20): $20 × 1% = $0.20 risk<br/>
            Stop distance = $1.65<br/>
            Shares = $0.20 ÷ $1.65 = 0.12 shares (fractional on Robinhood)<br/>
            Actual risk = 0.12 × $1.65 = $0.20 ✅
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">⚠️ Educational tool only. Not financial advice. Always verify your calculations before trading.</p>
    </div>
  )
}
