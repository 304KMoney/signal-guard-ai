'use client'
// Signal Guard AI — End-of-Day Review

import { useState } from 'react'

const GRADES: Record<string, { label: string; color: string; message: string }> = {
  A: { label: 'A', color: 'text-green-400', message: 'Excellent discipline. Followed every rule, journaled everything, stayed patient.' },
  B: { label: 'B', color: 'text-blue-400', message: 'Good day with minor deviations. You caught yourself and corrected. Keep building.' },
  C: { label: 'C', color: 'text-yellow-400', message: '1–2 rule breaks today. You need to review your pre-trade checklist before tomorrow.' },
  D: { label: 'D', color: 'text-orange-400', message: 'Multiple rule violations. Tomorrow is reduced-risk mode. Review what broke down.' },
  F: { label: 'F', color: 'text-red-400', message: 'Serious discipline breakdown. Consider a mandatory rest day tomorrow. This is how accounts get blown up.' },
}

export default function EODPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    followedPlan: null as boolean | null,
    onlyApproved: null as boolean | null,
    movedStop: null as boolean | null,
    chased: null as boolean | null,
    revenge: null as boolean | null,
    respectedLimit: null as boolean | null,
    lesson: '',
    tomorrowSelf: '',
  })
  const [grade, setGrade] = useState<string | null>(null)

  function calcGrade() {
    let score = 0
    if (answers.followedPlan) score++
    if (answers.onlyApproved) score++
    if (!answers.movedStop) score++
    if (!answers.chased) score++
    if (!answers.revenge) score++
    if (answers.respectedLimit) score++

    const hasLesson = answers.lesson.trim().length > 20
    if (hasLesson) score++

    const revengeOrBlowup = answers.revenge || !answers.respectedLimit
    if (revengeOrBlowup) return 'F'
    if (score >= 7) return 'A'
    if (score >= 5) return 'B'
    if (score >= 4) return 'C'
    if (score >= 3) return 'D'
    return 'F'
  }

  const questions = [
    {
      q: 'Did you follow your pre-approved trade plan today?',
      key: 'followedPlan',
      opts: [{ v: true, l: '✅ Yes — I stuck to the plan' }, { v: false, l: '❌ No — I deviated from the plan' }],
    },
    {
      q: 'Did you only take trades you approved in the morning?',
      key: 'onlyApproved',
      opts: [{ v: true, l: '✅ Yes — planned trades only' }, { v: false, l: '❌ No — I added unplanned trades' }],
    },
    {
      q: 'Did you move a stop loss to give a trade more room?',
      key: 'movedStop',
      opts: [{ v: false, l: '✅ No — stop stayed where it was set' }, { v: true, l: '❌ Yes — I moved my stop' }],
    },
    {
      q: 'Did you chase any entry above your planned zone?',
      key: 'chased',
      opts: [{ v: false, l: '✅ No — waited for my entry zone' }, { v: true, l: '❌ Yes — I chased a move' }],
    },
    {
      q: 'Did you revenge trade after a loss today?',
      key: 'revenge',
      opts: [{ v: false, l: '✅ No — stayed disciplined after losses' }, { v: true, l: '🚨 Yes — I took revenge trades' }],
    },
    {
      q: 'Did you respect your daily loss limit?',
      key: 'respectedLimit',
      opts: [{ v: true, l: '✅ Yes — stayed within daily limit' }, { v: false, l: '❌ No — I blew the daily limit' }],
    },
    {
      q: 'What is your one key lesson from today?',
      key: 'lesson',
      freeText: true,
    },
    {
      q: 'How should tomorrow look?',
      key: 'tomorrowSelf',
      opts: [
        { v: 'normal', l: '📈 Normal trading' },
        { v: 'reduced', l: '⚠️ Reduced risk (smaller size, fewer trades)' },
        { v: 'rest', l: '🧘 Rest day — no trading' },
      ],
    },
  ]

  if (grade) {
    const g = GRADES[grade]
    const tomorrowReduced = grade === 'D' || grade === 'F' || answers.tomorrowSelf === 'rest' || answers.tomorrowSelf === 'reduced'
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">🌙 End-of-Day Report</h1>
        <div className={`rounded-xl p-6 border ${grade === 'A' ? 'bg-green-950 border-green-800' : grade === 'B' ? 'bg-blue-950 border-blue-800' : grade === 'C' ? 'bg-yellow-950 border-yellow-700' : grade === 'D' ? 'bg-orange-950 border-orange-800' : 'bg-red-950 border-red-800'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-5xl font-black ${g.color}`}>{g.label}</div>
            <div>
              <div className="text-white font-bold">Today's Discipline Grade</div>
              <p className="text-gray-300 text-sm mt-1">{g.message}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-400 mb-4">REVIEW SUMMARY</h2>
          <div className="space-y-2">
            {[
              { label: 'Followed plan', value: answers.followedPlan },
              { label: 'Only approved trades', value: answers.onlyApproved },
              { label: 'Stop not moved', value: !answers.movedStop },
              { label: 'No chasing', value: !answers.chased },
              { label: 'No revenge trading', value: !answers.revenge },
              { label: 'Respected daily limit', value: answers.respectedLimit },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">{item.label}</span>
                <span className={item.value ? 'text-green-400' : 'text-red-400'}>{item.value ? '✅ Yes' : '❌ No'}</span>
              </div>
            ))}
          </div>
        </div>

        {answers.lesson && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-xs font-bold text-green-400 mb-2">💡 TODAY'S LESSON</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{answers.lesson}</p>
          </div>
        )}

        <div className={`rounded-xl p-5 border ${tomorrowReduced ? 'bg-yellow-950 border-yellow-700' : 'bg-gray-900 border-gray-800'}`}>
          <h2 className="text-sm font-bold text-gray-400 mb-2">TOMORROW'S APPROACH</h2>
          <p className={`font-bold ${tomorrowReduced ? 'text-yellow-400' : 'text-green-400'}`}>
            {answers.tomorrowSelf === 'rest' || grade === 'F' ? '🧘 Rest Day — No Trading' :
             answers.tomorrowSelf === 'reduced' || grade === 'D' ? '⚠️ Reduced Risk Mode' :
             '📈 Normal Trading'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {grade === 'F' ? 'Mandatory rest day after serious rule violations.' :
             grade === 'D' ? 'Cut position sizes in half tomorrow. Only 1 trade maximum.' :
             'Continue building good habits.'}
          </p>
        </div>

        <button onClick={() => { setStep(0); setGrade(null); setAnswers({ followedPlan: null, onlyApproved: null, movedStop: null, chased: null, revenge: null, respectedLimit: null, lesson: '', tomorrowSelf: '' }) }}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors">
          Redo Review
        </button>
      </div>
    )
  }

  const current = questions[step]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🌙 End-of-Day Review</h1>
        <p className="text-gray-400 text-sm mt-1">Honest debrief. 8 questions. 5 minutes.</p>
      </div>
      <div className="bg-gray-800 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>
      <p className="text-xs text-gray-500">Question {step + 1} of {questions.length}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Q{step + 1}: {current.q}</h2>
        {current.freeText ? (
          <div>
            <textarea
              value={answers.lesson}
              onChange={e => setAnswers(a => ({ ...a, lesson: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="What did today teach you? Be specific. At least 2 sentences."
            />
            <button
              onClick={() => { if (answers.lesson.trim().length > 10) setStep(s => s + 1) }}
              disabled={answers.lesson.trim().length <= 10}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Next →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {current.opts?.map(opt => (
              <button
                key={String(opt.v)}
                onClick={() => {
                  setAnswers(a => ({ ...a, [current.key]: opt.v }))
                  if (step < questions.length - 1) setStep(s => s + 1)
                  else setGrade(calcGrade())
                }}
                className="w-full text-left px-5 py-4 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-700 transition-colors"
              >
                {opt.l}
              </button>
            ))}
          </div>
        )}
      </div>
      {step > 0 && <button onClick={() => setStep(s => s - 1)} className="text-gray-400 hover:text-white text-sm">← Back</button>}
    </div>
  )
}
