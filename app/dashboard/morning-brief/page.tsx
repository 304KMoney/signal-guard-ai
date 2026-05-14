"use client";

import { useState } from "react";
import { DISCLAIMER } from "@/lib/claude";
import Link from "next/link";

const QUESTIONS = [
  {
    id: "sleep_quality",
    label: "Sleep Quality",
    question: "How well did you sleep last night?",
    options: ["Excellent (7-8+ hrs)", "Good (6-7 hrs)", "Poor (< 6 hrs)", "Terrible"],
  },
  {
    id: "emotional_state",
    label: "Emotional State",
    question: "How are you feeling right now?",
    options: ["Calm and focused", "Slightly anxious", "Excited/euphoric", "Stressed or angry", "Sad or distracted"],
  },
  {
    id: "capital_available",
    label: "Capital Available",
    question: "How much capital do you have available today?",
    options: ["Full account", "75% of account", "50% of account", "25% or less"],
  },
  {
    id: "news_awareness",
    label: "News Awareness",
    question: "Have you checked today's economic calendar and major news?",
    options: ["Yes, fully prepared", "Briefly checked", "Not yet", "No — I'll skip this check"],
  },
  {
    id: "premarket_conditions",
    label: "Pre-Market Conditions",
    question: "What are pre-market conditions showing?",
    options: ["Futures up, calm", "Futures up, volatile", "Futures down, calm", "Futures down, volatile", "Unclear/haven't checked"],
  },
  {
    id: "bias_confirmation",
    label: "Bias Confirmation",
    question: "Do you have a clear directional bias for today?",
    options: ["Yes — Bullish", "Yes — Bearish", "Neutral, waiting for confirmation", "No clear bias"],
  },
];

interface BriefResult {
  narrative: string;
  marketBias: string;
  disclaimer: string;
}

export default function MorningBriefPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/morning-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate brief");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate brief");
    } finally {
      setLoading(false);
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "BULLISH": return "text-green-400";
      case "BEARISH": return "text-red-400";
      case "NO_TRADE": return "text-orange-400";
      default: return "text-slate-400";
    }
  };

  const getBiasEmoji = (bias: string) => {
    switch (bias) {
      case "BULLISH": return "⬆";
      case "BEARISH": return "⬇";
      case "NO_TRADE": return "⛔";
      default: return "➡";
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">🌅 Morning Brief</h1>
        <p className="text-sm text-slate-500 mt-1">
          Answer 6 questions to get your AI-powered market briefing
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Check-in form */}
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="terminal-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-cyan-400 font-mono text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {q.label}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 mb-3">
                {q.question}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`text-left text-sm px-4 py-2 rounded-md border transition-colors ${
                      answers[q.id] === opt
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                        : "bg-[#0a0f1e] border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Mock market data display */}
          <div className="terminal-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              📡 Live Market Snapshot (Mock)
            </h3>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              {[
                { label: "SPY", value: "+0.42%", color: "text-green-400" },
                { label: "QQQ", value: "+0.61%", color: "text-green-400" },
                { label: "VIX", value: "16.3", color: "text-yellow-400" },
                { label: "BTC", value: "-1.2%", color: "text-red-400" },
                { label: "ETH", value: "-0.8%", color: "text-red-400" },
                { label: "ES", value: "+5 pts", color: "text-green-400" },
              ].map((item) => (
                <div key={item.label} className="bg-[#0a0f1e] p-2 rounded border border-slate-800">
                  <p className="text-slate-600">{item.label}</p>
                  <p className={`font-semibold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="w-full btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Generating AI Brief...
              </span>
            ) : (
              "Generate Morning Brief →"
            )}
          </button>

          {!allAnswered && (
            <p className="text-xs text-slate-600 text-center">
              Answer all 6 questions to continue
            </p>
          )}
        </div>
      ) : (
        /* Result */
        <div className="space-y-5">
          {/* Bias banner */}
          <div
            className={`p-5 rounded-lg border ${
              result.marketBias === "BULLISH"
                ? "bg-green-500/10 border-green-500/30"
                : result.marketBias === "BEARISH"
                ? "bg-red-500/10 border-red-500/30"
                : result.marketBias === "NO_TRADE"
                ? "bg-orange-900/20 border-orange-500/30"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${getBiasColor(result.marketBias)}`}>
                {getBiasEmoji(result.marketBias)}
              </span>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Market Bias
                </p>
                <p
                  className={`text-2xl font-bold ${getBiasColor(result.marketBias)}`}
                >
                  {result.marketBias.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* AI Narrative */}
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-3">
              📝 AI Market Briefing
            </h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result.narrative}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-banner">
            {result.disclaimer || DISCLAIMER}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/dashboard/scanner" className="btn-primary flex-1 text-center text-sm py-2.5">
              View Signals →
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="btn-secondary text-sm px-4"
            >
              Redo Check-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
