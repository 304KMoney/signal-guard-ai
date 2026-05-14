'use client'
// Signal Guard AI — Daily Check-In Page

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REASONS = [
  { value: 'setup',    label: '🎯 I see a specific quality setup I\'ve been watching', color: 'green' },
  { value: 'practice', label: '📚 I want to practice and learn (paper trading)', color: 'blue' },
  { value: 'money',    label: '💸 I need money / want to make money today', color: 'red' },
  { value: 'revenge',  label: '😤 I lost yesterday and want to make it back', color: 'red' },
  { value: 'boredom',  label: '😑 I\'m bored and want something to do', color: 'red' },
  { value: 'other',    label: '🤷 Other', color: 'yellow' },
]

export default function CheckInPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    accountSize: 500,
    isCalm: null as boolean | null,
    maxLossToday: 25,
    hasTime: null as boolean | null,
    tradingReason: '',
    shouldTrade: null as boolean | null,
  })
  const [result, setResult] = useState<null | { recommendation: string; reasoning: string; warnings: string[]; message: string }>(null)

  const BLOCKED_REASONS = ['money', 'revenge', 'boredom']
  const isBlockedReason = BLOCKED_REASONS.includes(answers.tradingReason)

  function getRecommendation() {
    const warnings: string[] = []
    let recommendation = 'trade'
    let reasoning = ''
    let message = ''

    if (!answers.isCalm) {
      recommendation = 'no_trade'
      reasoning = 'You indicated you are not calm or focused. Trading while stressed leads to impulsive decisions and losses.'
      message = 'Take the day off. Protect your capital. The market will be there tomorrow.'
      warnings.push('Not emotionally ready to trade')
    } else if (answers.tradingReason === 'revenge') {
      recommendation = 'no_trade'
      reasoning = 'Revenge trading is one of the top causes of account blowups. You are trading emotionally, not strategically.'
      message = '🛑 Do not trade today. Close the app. Go for a walk. Come back tomorrow with a clear head.'
      warnings.push('Revenge trading detected — strong no-trade signal')
    } else if (answers.tradingReason === 'money') {
      recommendation = 'no_trade'
      reasoning = 'Trading because you need money creates pressure that leads to bad decisions. The market does not care about your bills.'
      message = 'Trading out of financial pressure is a trap. Only trade when you have a quality setup — not because you need a win.'
      warnings.push('Financial pressure as motivation — dangerous mindset')
    } else if (answers.tradingReason === 'boredom') {
      recommendation = 'no_trade'
      reasoning = 'Boredom trading = paying tuition to the market. No setup, no trade.'
      message = 'There is nothing to do today unless there\'s a real setup. Read a chart. Review your journal. Don\'t trade for entertainment.'
      warnings.push('Boredom as motivation — no trade')
    } else if (!answers.hasTime) {
      recommendation = 'reduced'
      reasoning = 'Limited monitoring time means you should only take swing setups with wide stops, not intraday trades.'
      message = 'If you take a trade, use limit orders, set your stop immediately, and check in 2–3 times max.'
      warnings.push('Limited time to monitor — intraday trades not recommended')
    } else if (answers.maxLossToday > answers.accountSize * 0.05) {
      recommendation = 'reduced'
      reasoning = `Your stated loss tolerance ($${answers.maxLossToday}) exceeds the 5% daily limit ($${(answers.accountSize * 0.05).toFixed(2)}). Capping at 5%.`
      message = 'Risk cap enforced. Daily loss limit is 5% of account.'
      warnings.push('Stated loss tolerance exceeds 5% daily limit')
    } else {
      recommendation = 'trade'
      reasoning = 'All checks pass. You are cleared to trade today with the setups that meet the 70+ score threshold.'
      message = '✅ You are cleared to trade. Stick to the plan. Max 2 trades. Stop after 2 losses. No chasing.'
    }

    return { recommendation, reasoning, warnings, message }
  }

  function handleSubmit() {
    const result = getRecommendation()
    setResult(result)
    setStep(7)
  }

  if (result && step === 7) {
    const isBlocked = result.recommendation === 'no_trade'
    const isReduced = result.recommendation === 'reduced'
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">✅ Check-In Complete</h1>
        <div className={`rounded-xl p-6 border ${
          isBlocked ? 'bg-red-950 border-red-800' :
          isReduced ? 'bg-yellow-950 border-yellow-700' :
          'bg-green-950 border-green-800'
        }`}>
          <div className="text-2xl mb-3">
            {isBlocked ? '🛑' : isReduced ? '⚠️' : '✅'}
          </div>
          <div className={`text-xl font-bold mb-2 ${
            isBlocked ? 'text-red-400' : isReduced ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {isBlocked ? 'NO TRADE TODAY' : isReduced ? 'REDUCED RISK MODE' : 'CLEARED TO TRADE'}
          </div>
          <p className="text-gray-300 mb-4">{result.reasoning}</p>
          <p className="font-semibold text-white">{result.message}</p>
          {result.warnings.length > 0 && (
            <div className="mt-4 space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-sm text-yellow-400">⚠️ {w}</p>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-400 mb-3">TODAY'S LIMITS</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Account Size', value: `$${answers.accountSize.toFixed(2)}` },
              { label: 'Max Risk / Trade', value: `$${(answers.accountSize * 0.01).toFixed(2)}` },
              { label: 'Daily Loss Limit', value: `$${Math.min(answers.maxLossToday, answers.accountSize * 0.05).toFixed(2)}` },
              { label: 'Max Trades Today', value: isBlocked ? '0' : isReduced ? '1' : '2' },
            ].map(item => (
              <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className="text-white font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {!isBlocked && (
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              View Morning Brief →
            </button>
          )}
          <button
            onClick={() => { setStep(0); setResult(null); setAnswers({ accountSize: 500, isCalm: null, maxLossToday: 25, hasTime: null, tradingReason: '', shouldTrade: null }) }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Redo Check-In
          </button>
        </div>
      </div>
    )
  }

  const steps = [
    // Q1
    <div key="q1" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q1 / 6 — What is your account size today?</h2>
      <p className="text-gray-400 text-sm">This is used to calculate all dollar risk limits for today.</p>
      <div className="space-y-3">
        {[500, 250, 100, 50, 20].map(size => (
          <button
            key={size}
            onClick={() => { setAnswers(a => ({ ...a, accountSize: size, maxLossToday: +(size * 0.05).toFixed(2) })); setStep(1) }}
            className={`w-full text-left px-5 py-3 rounded-lg border transition-colors ${answers.accountSize === size ? 'border-blue-500 bg-blue-900/40 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}`}
          >
            ${size.toFixed(2)} {size === 500 ? '(paper default)' : size === 20 ? '(live starting capital)' : ''}
          </button>
        ))}
        <p className="text-xs text-gray-500">Paper mode: $500 simulated | Live mode: $20 real</p>
      </div>
    </div>,
    // Q2
    <div key="q2" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q2 / 6 — Are you emotionally calm and focused?</h2>
      <p className="text-gray-400 text-sm">Not stressed, not sleep-deprived, not angry, not overly excited.</p>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: true, label: '✅ Yes — I am calm and ready', color: 'green' },
          { value: false, label: '❌ No — I am stressed, tired, anxious, or emotional', color: 'red' },
        ].map(opt => (
          <button key={String(opt.value)} onClick={() => { setAnswers(a => ({ ...a, isCalm: opt.value })); setStep(2) }}
            className={`w-full text-left px-5 py-4 rounded-lg border transition-colors ${opt.color === 'green' ? 'border-green-700 bg-green-950 hover:bg-green-900 text-green-300' : 'border-red-700 bg-red-950 hover:bg-red-900 text-red-300'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>,
    // Q3
    <div key="q3" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q3 / 6 — Max dollar loss you are comfortable with today?</h2>
      <p className="text-gray-400 text-sm">Your answer is capped at 5% of account (${(answers.accountSize * 0.05).toFixed(2)}). The lower number is used.</p>
      <div className="space-y-3">
        {[answers.accountSize * 0.01, answers.accountSize * 0.02, answers.accountSize * 0.05].map(amount => (
          <button key={amount} onClick={() => { setAnswers(a => ({ ...a, maxLossToday: +amount.toFixed(2) })); setStep(3) }}
            className="w-full text-left px-5 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 transition-colors">
            ${amount.toFixed(2)} ({amount === answers.accountSize * 0.01 ? '1% — conservative' : amount === answers.accountSize * 0.02 ? '2% — moderate' : '5% — maximum allowed'})
          </button>
        ))}
      </div>
    </div>,
    // Q4
    <div key="q4" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q4 / 6 — Do you have time to monitor trades today?</h2>
      <p className="text-gray-400 text-sm">At least 2 hours of active monitoring for intraday trades.</p>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: true, label: '✅ Yes — I can watch for 2+ hours', note: '' },
          { value: false, label: '⚠️ No — limited time today', note: 'Swing/crypto only if trading' },
        ].map(opt => (
          <button key={String(opt.value)} onClick={() => { setAnswers(a => ({ ...a, hasTime: opt.value })); setStep(4) }}
            className="w-full text-left px-5 py-4 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 transition-colors">
            {opt.label}
            {opt.note && <span className="block text-xs text-yellow-400 mt-1">{opt.note}</span>}
          </button>
        ))}
      </div>
    </div>,
    // Q5
    <div key="q5" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q5 / 6 — Why do you want to trade today?</h2>
      <p className="text-gray-400 text-sm">Be honest. This is your private check-in.</p>
      <div className="space-y-2">
        {REASONS.map(reason => (
          <button key={reason.value} onClick={() => { setAnswers(a => ({ ...a, tradingReason: reason.value })); setStep(5) }}
            className={`w-full text-left px-5 py-3 rounded-lg border transition-colors ${
              reason.color === 'red' ? 'border-red-800 bg-red-950/50 text-red-300 hover:bg-red-950' :
              reason.color === 'green' ? 'border-green-800 bg-green-950/50 text-green-300 hover:bg-green-950' :
              reason.color === 'blue' ? 'border-blue-800 bg-blue-950/50 text-blue-300 hover:bg-blue-950' :
              'border-yellow-800 bg-yellow-950/50 text-yellow-300 hover:bg-yellow-950'
            }`}>
            {reason.label}
          </button>
        ))}
      </div>
      {isBlockedReason && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-4">
          <p className="text-red-400 font-semibold text-sm">🛑 This reason triggers a no-trade recommendation.</p>
          <p className="text-red-300 text-xs mt-1">Trading out of financial pressure, revenge, or boredom is how accounts get blown up.</p>
        </div>
      )}
    </div>,
    // Q6
    <div key="q6" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Q6 / 6 — Do YOU think today should be a trading day?</h2>
      <p className="text-gray-400 text-sm">Your gut check. The AI will factor in all your previous answers.</p>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: true, label: '📈 Yes — I have a reason and a setup' },
          { value: false, label: '🧘 No — I\'ll sit out today' },
        ].map(opt => (
          <button key={String(opt.value)} onClick={() => { setAnswers(a => ({ ...a, shouldTrade: opt.value })); setStep(6) }}
            className="w-full text-left px-5 py-4 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 transition-colors">
            {opt.label}
          </button>
        ))}
      </div>
    </div>,
    // Confirm
    <div key="confirm" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Review Your Check-In</h2>
      <div className="bg-gray-800 rounded-xl p-5 space-y-3">
        {[
          { label: 'Account Size', value: `$${answers.accountSize}` },
          { label: 'Emotionally Ready', value: answers.isCalm ? '✅ Yes' : '❌ No' },
          { label: 'Max Loss Today', value: `$${answers.maxLossToday}` },
          { label: 'Has Time', value: answers.hasTime ? '✅ Yes' : '⚠️ Limited' },
          { label: 'Trading Reason', value: REASONS.find(r => r.value === answers.tradingReason)?.label ?? answers.tradingReason },
          { label: 'Self Assessment', value: answers.shouldTrade ? 'Trade' : 'No Trade' },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
            <span className="text-gray-400">{item.label}</span>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg">
        Get AI Assessment →
      </button>
    </div>,
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">✅ Daily Check-In</h1>
        <p className="text-gray-400 text-sm mt-1">Complete before trading. Honest answers only.</p>
      </div>
      {/* Progress bar */}
      <div className="bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${(Math.min(step, 6) / 6) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">Step {Math.min(step + 1, 7)} of 7</p>
      {/* Current step */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {steps[Math.min(step, steps.length - 1)]}
      </div>
      {/* Back button */}
      {step > 0 && step < 7 && (
        <button onClick={() => setStep(s => Math.max(0, s - 1))}
          className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
          ← Back
        </button>
      )}
    </div>
  )
}
