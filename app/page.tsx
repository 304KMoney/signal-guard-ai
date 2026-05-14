import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-xl font-bold glow-cyan">⚡</span>
            <span className="font-bold text-lg tracking-tight">Signal Guard AI</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-primary text-sm">
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Paper Trading Mode Available — Start Risk-Free
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your AI Trading{" "}
          <span className="text-cyan-400 glow-cyan">Discipline</span> Coach
        </h1>

        <p className="text-xl text-slate-400 mb-4 max-w-2xl mx-auto">
          AI-generated signals, risk calculations, and morning briefings — but{" "}
          <strong className="text-slate-200">every trade requires your manual approval.</strong>
        </p>

        <p className="text-sm text-slate-500 mb-10 max-w-xl mx-auto">
          Built for the disciplined trader who wants structure, not automation.
          Signal Guard AI helps you stay rule-based and protect your capital.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/sign-up" className="btn-primary text-base px-8 py-3">
            Start Free — Paper Trading
          </Link>
          <Link href="/sign-in" className="btn-secondary text-base px-8 py-3">
            Sign In
          </Link>
        </div>

        <p className="text-xs text-slate-600">
          ⚠️ Not financial advice. Not an auto-trader. Your decisions, your responsibility.
        </p>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12 text-slate-300">
          What Signal Guard AI Does
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🌅",
              title: "Morning Brief",
              desc: "AI analyzes pre-market data and gives you a market bias + top 3 setups to watch.",
              color: "text-yellow-400",
            },
            {
              icon: "🔍",
              title: "Signal Scanner",
              desc: "Multi-market signal scanner scores setups 0–100. Only shows signals ≥ 70. Max 3.",
              color: "text-cyan-400",
            },
            {
              icon: "⚖️",
              title: "Risk Calculator",
              desc: "Auto-calculates position size, dollar risk, and R:R ratio before you touch a trade.",
              color: "text-green-400",
            },
            {
              icon: "📓",
              title: "Trade Journal",
              desc: "Log every trade. AI reviews your performance and surfaces lessons after each session.",
              color: "text-orange-400",
            },
          ].map((f) => (
            <div key={f.title} className="terminal-card p-6">
              <div className={`text-3xl mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-semibold text-slate-200 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk rules preview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="terminal-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-red-400 text-xl">🛡️</span>
            <h2 className="text-xl font-bold text-slate-200">
              Built-in Risk Rules Engine
            </h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Signal Guard AI checks every trade against hard rules before showing you a plan.
            It never auto-blocks — you always decide — but it always warns you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Never risk more than 2% of account on any single trade",
              "Max 3 open positions at once",
              "No trading in the first 15 minutes of market open",
              "Stop after 2 consecutive losses in a day",
              "Minimum R:R ratio of 1.5:1 required",
              "Flag high-impact news events within 2 hours",
            ].map((rule, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-slate-400"
              >
                <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                {rule}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12 text-slate-300">
          Your Morning Routine
        </h2>
        <div className="flex flex-col md:flex-row gap-0 relative">
          {[
            { step: "01", title: "Check In", desc: "Answer 6 quick questions about your emotional state and readiness to trade." },
            { step: "02", title: "Get Briefed", desc: "AI analyzes pre-market data and gives you a market bias with clear reasoning." },
            { step: "03", title: "Review Signals", desc: "See today's top 3 scored setups with full risk/reward analysis." },
            { step: "04", title: "Approve or Skip", desc: "You manually approve each trade. AI never places orders automatically." },
          ].map((s, i) => (
            <div key={s.step} className="flex-1 relative">
              <div className={`terminal-card p-6 ${i < 3 ? "md:mr-0" : ""}`}>
                <div className="text-cyan-400 font-mono text-xs mb-2 glow-cyan">{s.step}</div>
                <h3 className="font-semibold text-slate-200 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <span className="text-slate-600 text-lg">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="terminal-card p-12">
          <h2 className="text-3xl font-bold mb-4">
            Start Trading with <span className="text-cyan-400">Discipline</span>
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Begin in paper trading mode — no real money, no risk. Build your
            system before going live.
          </p>
          <Link href="/sign-up" className="btn-primary text-base px-10 py-3">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-slate-600">
            ⚠️ Signal Guard AI is for personal educational and decision-support use only. 
            It does not guarantee profits, does not predict markets with certainty, and does not place trades automatically. 
            All trade decisions are made by you, the human. Trading involves substantial risk of loss. 
            Never trade with money you cannot afford to lose. This is not financial advice.
          </p>
          <p className="text-xs text-slate-700 mt-3">
            © {new Date().getFullYear()} Signal Guard AI
          </p>
        </div>
      </footer>
    </div>
  );
}
