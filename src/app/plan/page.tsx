'use client'
// Signal Guard AI — Trade Plan Page
// TODO: Replace mock data with real plan from DB based on ?signal= query param

import { useState } from 'react'
import { MOCK_TRADE_PLANS, MOCK_SIGNALS } from '@/lib/mock-data'
import { runAllRules } from '@/lib/risk-rules'
import { formatCurrency, gradeColor, scoreColor } from '@/lib/utils'

export default function PlanPage() {
  const plan = MOCK_TRADE_PLANS[0]
  const signal = MOCK_SIGNALS.find(s => s.id === plan.signalId) ?? MOCK_SIGNALS[0]
  const [confirmed, setConfirmed] = useState(false)
  const [approved, setApproved] = useState<boolean | null>(null)
  const [showChecklist, setShowChecklist] = useState(false)

  // Run risk rules with mock state
  const riskCheck = runAllRules(
    {
      ticker: plan.ticker,
      marketType: plan.marketType as any,
      riskDollars: Number(plan.riskDollars),
      rrRatio: Number(plan.rrRatio),
      signalScore: signal.totalScore,
      positionSizeUsd: Number(plan.positionSize) * Number(plan.entryHigh ?? plan.entryLow ?? 0),
      isOptions: false,
      isNearNews: false,
      isFuturesNearClose: false,
    },
    {
      tradesToday: 0,
      lossesToday: 0,
      dailyPnl: 0,
      checkinComplete: true,
      lastTradeResult: undefined,
    },
    {
      accountSize: Number(plan.accountSize),
      maxRiskPct: 0.01,
      maxTradesDay: 2,
      maxLossDay: Number(plan.accountSize) * 0.05,
      minSignalScore: 70,
      minRrRatio: 2.0,
      tradingMode: 'paper',
    }
  )

  if (showChecklist && approved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">📱 Robinhood Execution Checklist</h1>
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-5">
          <p className="text-yellow-400 font-bold">⚠️ PAPER MODE — This is a simulated trade only</p>
          <p className="text-yellow-300 text-sm mt-1">Record this in your journal as a paper trade. Do not open Robinhood for this.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-white">Order Entry — {plan.ticker}</h2>
          {[
            { step: '1', title: 'Open Robinhood → Search', content: `Search: ${plan.ticker}` },
            { step: '2', title: 'Select Order Type', content: 'Tap: Buy → Order Type: LIMIT ORDER (not market!)' },
            { step: '3', title: 'Set Entry', content: `Limit Price: $${plan.entryHigh} (pay up $0.10 for better fill chance)` },
            { step: '4', title: 'Set Shares', content: `Shares: ${plan.positionSize} (fractional OK on Robinhood)` },
            { step: '5', title: 'Time in Force', content: 'Select: Day (expires at market close if unfilled)' },
            { step: '6', title: 'Review → Confirm', content: 'Double-check: ticker, direction (BUY), price, shares. Then confirm.' },
            { step: '7', title: 'IMMEDIATELY set Stop Loss', content: `After fill: Go to ${plan.ticker} → Sell → Stop-Limit\nStop: $${plan.stopLoss} | Limit: $${(Number(plan.stopLoss) - 0.20).toFixed(2)}\nShares: ${plan.positionSize} (all of them)` },
            { step: '8', title: 'Set a Price Alert', content: `Set alert at $${plan.takeProfit1} (your TP1). Do not watch price every 2 minutes.` },
            { step: '9', title: 'Log the Trade', content: 'Go to Trade Journal → Add Entry. Record actual fill price immediately.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4 bg-gray-800 rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{item.title}</div>
                <div className="text-gray-300 text-sm mt-1 whitespace-pre-line">{item.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-3">Rules Reminder</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>🛑 If stop is hit — let it hit. Do NOT cancel it.</li>
            <li>🛑 Do not move the stop further down to "give it more room"</li>
            <li>🛑 Do not add more shares if price goes against you</li>
            <li>✅ At TP1: sell half, move stop to breakeven on the rest</li>
            <li>✅ If the plan is invalidated — exit. No exceptions.</li>
          </ul>
        </div>
        <button onClick={() => setShowChecklist(false)} className="text-gray-400 hover:text-white text-sm">← Back to Trade Plan</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📋 Trade Plan — {plan.ticker}</h1>
          <p className="text-gray-400 text-sm mt-1">Review all levels and risk check before approving</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-2 py-1 rounded ${gradeColor(signal.grade ?? 'F')}`}>{signal.grade}</span>
          <span className={`text-2xl font-bold ${scoreColor(signal.totalScore)}`}>{signal.totalScore}<span className="text-sm text-gray-400">/100</span></span>
        </div>
      </div>

      {/* Action badge */}
      <div className={`rounded-xl p-4 border flex items-center gap-4 ${
        plan.action === 'buy' ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-800'
      }`}>
        <span className={`text-2xl font-bold ${plan.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
          {plan.action === 'buy' ? '⬆ BUY LONG' : '⬇ SELL SHORT'}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-300">{plan.ticker}</span>
        <span className="text-gray-500 text-sm capitalize">{plan.marketType}</span>
        <div className="ml-auto text-right">
          <div className="text-white font-bold">Confidence: {plan.confidenceScore}%</div>
        </div>
      </div>

      {/* Trade levels */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: '📍 Entry Zone', value: `$${plan.entryLow} – $${plan.entryHigh}`, color: 'text-blue-400' },
          { label: '🛑 Stop Loss', value: `$${plan.stopLoss}`, color: 'text-red-400' },
          { label: '🎯 Take Profit 1', value: `$${plan.takeProfit1}`, color: 'text-green-400' },
          { label: '🎯 Take Profit 2', value: plan.takeProfit2 ? `$${plan.takeProfit2}` : '—', color: 'text-green-300' },
          { label: '⚖️ Risk / Reward', value: `1:${plan.rrRatio}`, color: Number(plan.rrRatio) >= 2 ? 'text-green-400' : 'text-red-400' },
          { label: '📊 Confidence', value: `${plan.confidenceScore}%`, color: 'text-blue-400' },
        ].map(item => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{item.label}</div>
            <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Position sizing */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 mb-4">⚖️ POSITION SIZING (1% RISK RULE)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Account Size', value: formatCurrency(Number(plan.accountSize)) },
            { label: 'Max Risk (1%)', value: formatCurrency(Number(plan.maxDollarRisk)) },
            { label: 'Dollar at Risk', value: formatCurrency(Number(plan.riskDollars)), highlight: true },
            { label: 'Shares / Units', value: `${plan.positionSize}` },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-3 ${item.highlight ? 'bg-blue-900/30 border border-blue-800' : 'bg-gray-800'}`}>
              <div className="text-xs text-gray-400">{item.label}</div>
              <div className={`font-bold ${item.highlight ? 'text-blue-300' : 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reason + Invalidation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-xs font-bold text-gray-400 mb-2">WHY THIS TRADE</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{plan.tradeReason}</p>
        </div>
        <div className="bg-gray-900 border border-red-900 rounded-xl p-5">
          <h2 className="text-xs font-bold text-red-400 mb-2">🚫 TRADE INVALIDATION</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{plan.invalidation}</p>
          <p className="text-red-400 text-xs mt-2">If this happens — exit immediately. No second-guessing.</p>
        </div>
      </div>

      {/* Plain English */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-xs font-bold text-gray-400 mb-2">🗣 PLAIN ENGLISH EXPLANATION</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{plan.plainEnglish}</p>
      </div>

      {/* Risk Rules Check */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">🛡 RISK RULES CHECK</h2>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${riskCheck.passed ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
            {riskCheck.passed ? '✅ ALL PASSED' : `❌ ${riskCheck.violations.length} VIOLATION(S)`}
          </span>
        </div>
        <div className="space-y-2">
          {riskCheck.violations.filter(r => !r.passed).length === 0 && riskCheck.violations.length === 0 && (
            <p className="text-gray-500 text-sm">All rules passed.</p>
          )}
          {/* Show all rules */}
          {runAllRules(
            { ticker: plan.ticker, marketType: plan.marketType as any, riskDollars: Number(plan.riskDollars), rrRatio: Number(plan.rrRatio), signalScore: signal.totalScore, positionSizeUsd: Number(plan.positionSize) * Number(plan.entryHigh ?? 0), isOptions: false, isNearNews: false, isFuturesNearClose: false },
            { tradesToday: 0, lossesToday: 0, dailyPnl: 0, checkinComplete: true },
            { accountSize: Number(plan.accountSize), maxRiskPct: 0.01, maxTradesDay: 2, maxLossDay: Number(plan.accountSize) * 0.05, minSignalScore: 70, minRrRatio: 2.0, tradingMode: 'paper' }
          ).violations.map(rule => (
            <div key={rule.ruleId} className={`flex items-start gap-3 rounded-lg p-3 text-sm ${rule.passed ? 'bg-green-950/30' : 'bg-red-950/30'}`}>
              <span className="shrink-0">{rule.passed ? '✅' : '❌'}</span>
              <div>
                <span className="font-medium text-gray-200">{rule.ruleName}</span>
                <p className="text-gray-400 text-xs mt-0.5">{rule.message}</p>
              </div>
            </div>
          ))}
        </div>
        {riskCheck.warnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {riskCheck.warnings.map((w, i) => (
              <div key={i} className="bg-yellow-950/30 rounded-lg p-3 text-sm text-yellow-400">{w}</div>
            ))}
          </div>
        )}
      </div>

      {/* Approve / Skip */}
      {approved === null ? (
        <div className="grid grid-cols-2 gap-4">
          {!confirmed ? (
            <>
              <button
                onClick={() => setConfirmed(true)}
                disabled={!riskCheck.passed}
                className={`py-4 rounded-xl font-bold text-lg transition-colors ${riskCheck.passed ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              >
                ✅ Approve Trade
              </button>
              <button onClick={() => setApproved(false)} className="py-4 rounded-xl font-bold text-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                ❌ Skip This Trade
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setApproved(true); setShowChecklist(true) }}
                className="py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-colors col-span-2">
                ✅ CONFIRM — Log as Paper Trade and Show Checklist
              </button>
              <button onClick={() => setConfirmed(false)} className="text-gray-400 hover:text-white text-sm col-span-2 text-center">
                Cancel
              </button>
            </>
          )}
        </div>
      ) : approved ? (
        <div className="bg-green-950 border border-green-800 rounded-xl p-5 text-center">
          <p className="text-green-400 font-bold text-lg">✅ Trade Approved — Paper Mode</p>
          <p className="text-gray-300 text-sm mt-1">Logged to your journal. Follow the execution checklist.</p>
          <button onClick={() => setShowChecklist(true)} className="mt-3 bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm transition-colors">
            View Robinhood Checklist →
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
          <p className="text-gray-300 font-bold text-lg">⏭ Trade Skipped</p>
          <p className="text-gray-400 text-sm mt-1">Good discipline. Skipping a marginal trade is a valid decision.</p>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        ⚠️ Signal Guard AI never places trades automatically. All execution is manual via Robinhood. Not financial advice.
      </p>
    </div>
  )
}
