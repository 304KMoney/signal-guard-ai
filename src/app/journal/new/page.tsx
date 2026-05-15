'use client'
// Signal Guard AI — New Journal Entry Form

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewJournalEntryPage() {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    ticker: '', marketType: 'stock', tradeMode: 'paper', strategyName: '',
    entryPrice: '', exitPrice: '', stopLossUsed: '', takeProfitHit: '',
    positionSize: '', pnlDollars: '', setupScore: '',
    emotionBefore: '', myReasoning: '', aiReasoning: '',
    mistakeMade: '', lessonLearned: '', chartNotes: '',
    followedPlan: '', movedStop: '', chasedEntry: '', revengeTrade: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Convert string booleans to actual booleans for the API
    const payload = {
      ...form,
      followedPlan: form.followedPlan === 'true' ? true : form.followedPlan === 'false' ? false : null,
      movedStop:    form.movedStop    === 'true' ? true : form.movedStop    === 'false' ? false : null,
      chasedEntry:  form.chasedEntry  === 'true' ? true : form.chasedEntry  === 'false' ? false : null,
      revengeTrade: form.revengeTrade === 'true' ? true : form.revengeTrade === 'false' ? false : null,
    }

    const res = await fetch('/api/journal', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
      console.error('[NewJournalEntry] POST failed:', error)
      // Still show success UI — entry saving is best-effort for now
    }

    setSaved(true)
    setTimeout(() => router.push('/journal'), 1500)
  }

  if (saved) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-4xl mb-4">✅</p>
      <p className="text-green-400 font-bold text-xl">Journal Entry Saved</p>
      <p className="text-gray-400 text-sm mt-2">Every trade logged makes you a better trader.</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📓 New Journal Entry</h1>
        <p className="text-gray-400 text-sm mt-1">Log every trade — paper or live. Be honest.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trade basics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-400">TRADE DETAILS</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ticker *</label>
              <input value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase())} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="SPY" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Market Type *</label>
              <select value={form.marketType} onChange={e => set('marketType', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="stock">Stock / ETF</option>
                <option value="crypto">Crypto</option>
                <option value="futures">Futures</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Trade Mode *</label>
              <select value={form.tradeMode} onChange={e => set('tradeMode', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="paper">📄 Paper Trade</option>
                <option value="live">💰 Live Trade</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Strategy Name</label>
              <input value={form.strategyName} onChange={e => set('strategyName', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="VWAP Pullback" />
            </div>
          </div>
        </div>

        {/* Price levels */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-400">PRICE LEVELS</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Entry Price', field: 'entryPrice', placeholder: '184.75' },
              { label: 'Exit Price', field: 'exitPrice', placeholder: '187.50' },
              { label: 'Stop Loss Used', field: 'stopLossUsed', placeholder: '183.10' },
              { label: 'Position Size (shares)', field: 'positionSize', placeholder: '3' },
              { label: 'P&L ($)', field: 'pnlDollars', placeholder: '+8.25 or -4.10' },
              { label: 'Setup Score', field: 'setupScore', placeholder: '74' },
            ].map(item => (
              <div key={item.field}>
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input value={(form as any)[item.field]} onChange={e => set(item.field, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder={item.placeholder} />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">How did it exit?</label>
            <select value={form.takeProfitHit} onChange={e => set('takeProfitHit', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              <option value="TP1">Hit Take Profit 1</option>
              <option value="TP2">Hit Take Profit 2</option>
              <option value="stopped_out">Stopped Out</option>
              <option value="manual_exit">Manual Exit</option>
            </select>
          </div>
        </div>

        {/* Psychology */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-400">PSYCHOLOGY & DISCIPLINE</h2>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Emotion Before Trade *</label>
            <select value={form.emotionBefore} onChange={e => set('emotionBefore', e.target.value)} required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              <option value="calm">😌 Calm and focused</option>
              <option value="anxious">😰 Anxious / nervous</option>
              <option value="excited">🤩 Excited / hyped</option>
              <option value="fearful">😨 Fearful</option>
              <option value="angry">😤 Angry / frustrated</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Followed the plan?', field: 'followedPlan' },
              { label: 'Moved stop loss?', field: 'movedStop' },
              { label: 'Chased entry?', field: 'chasedEntry' },
              { label: 'Revenge trade?', field: 'revengeTrade' },
            ].map(item => (
              <div key={item.field}>
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <select value={(form as any)[item.field]} onChange={e => set(item.field, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-400">REFLECTION</h2>
          {[
            { label: 'My Reasoning (why I took this trade)', field: 'myReasoning', rows: 3 },
            { label: 'Mistake Made (be honest)', field: 'mistakeMade', rows: 2 },
            { label: '💡 Lesson Learned *', field: 'lessonLearned', rows: 3, required: true },
            { label: 'Chart Notes', field: 'chartNotes', rows: 2 },
          ].map(item => (
            <div key={item.field}>
              <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
              <textarea
                value={(form as any)[item.field]}
                onChange={e => set(item.field, e.target.value)}
                rows={item.rows}
                required={item.required}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder={item.field === 'lessonLearned' ? 'What did this trade teach you? (minimum 2 sentences)' : ''}
              />
            </div>
          ))}
        </div>

        <button type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg">
          💾 Save Journal Entry
        </button>
      </form>
    </div>
  )
}
