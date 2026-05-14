import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSignalById } from "@/lib/mock-signals";
import { runRiskChecks, calculatePositionSize } from "@/lib/risk-rules";
import { formatPrice, formatCurrency, getScoreBadge } from "@/lib/utils";
import ApproveSkipButtons from "./ApproveSkipButtons";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TradePlanPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const signal = getSignalById(id);
  if (!signal) notFound();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const accountSize = user?.accountSize?.toNumber() ?? 150;
  const riskPct = user?.maxDailyLossPct?.toNumber() ?? 2.0;

  // Calculate position sizing
  const { positionSize, dollarRisk, maxRiskDollars } = calculatePositionSize(
    accountSize,
    riskPct,
    signal.entryLow,
    signal.stopLoss
  );

  // Count open positions for risk check
  const openCount = await prisma.trade.count({
    where: { userId: user?.id ?? "", status: "OPEN" },
  });

  // Run risk checks
  const riskResult = runRiskChecks({
    accountSize,
    entryPrice: signal.entryLow,
    stopLoss: signal.stopLoss,
    positionSize,
    rrRatio: signal.rrRatio,
    openPositions: openCount,
    consecutiveLossesToday: 0, // TODO: calculate from DB
    hasHighImpactNewsWithin2h: false,
  });

  const badge = getScoreBadge(signal.score);
  const price = (v: number) => formatPrice(v);

  // Robinhood checklist steps
  const robinhoodSteps = [
    "Open Robinhood app or web platform",
    `Search for ${signal.ticker}`,
    "Tap 'Trade' → 'Buy' (for Long) or 'Sell' for Short",
    `Set Order Type: Limit Order at $${signal.entryHigh.toFixed(2)} or better`,
    `Set Quantity: ${positionSize} shares/units`,
    `Confirm total cost ≈ ${formatCurrency(positionSize * signal.entryLow)}`,
    "Review order summary — double-check ticker and size",
    `Set Stop Loss alert at $${signal.stopLoss.toFixed(2)} (manual stop)`,
    "Submit order — screenshot confirmation",
    "Log trade in Signal Guard journal",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/scanner"
          className="text-slate-500 hover:text-slate-300 text-sm"
        >
          ← Back to Scanner
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-slate-200">
              {signal.ticker}
            </h1>
            <span
              className={`font-bold text-sm ${
                signal.direction === "LONG" ? "text-green-400" : "text-red-400"
              }`}
            >
              {signal.direction}
            </span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              {signal.market}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{signal.signalType}</p>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex font-mono font-bold text-lg px-3 py-1 rounded border ${badge.color}`}
          >
            {signal.score}/100
          </div>
          <p className="text-xs text-slate-600 mt-1">Signal Score</p>
        </div>
      </div>

      {/* Risk violation warnings */}
      {riskResult.violations.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 space-y-2">
          <p className="text-sm font-semibold text-red-400">
            ⚠️ Risk Rule Warnings
          </p>
          {riskResult.violations.map((v) => (
            <div key={v.ruleId} className="flex items-start gap-2">
              <span
                className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                  v.severity === "HARD"
                    ? "text-red-400 border-red-400/30 bg-red-400/10"
                    : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                }`}
              >
                {v.severity}
              </span>
              <p className="text-sm text-red-300">{v.description}</p>
            </div>
          ))}
          <p className="text-xs text-slate-500 mt-2">
            Warnings are advisory only. You decide whether to trade.
          </p>
        </div>
      )}

      {riskResult.passed && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-green-400 font-semibold">
            ✅ All risk rules passed
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Trade levels */}
        <div className="space-y-5">
          {/* Levels card */}
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">Trade Levels</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Entry Zone</span>
                <span className="text-slate-200">
                  {price(signal.entryLow)} – {price(signal.entryHigh)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Stop Loss</span>
                <span className="text-red-400 font-semibold">
                  {price(signal.stopLoss)}
                </span>
              </div>
              <hr className="border-slate-800" />
              <div className="flex justify-between">
                <span className="text-green-400">Take Profit 1</span>
                <span className="text-green-400 font-semibold">
                  {price(signal.tp1)}
                </span>
              </div>
              {signal.tp2 && (
                <div className="flex justify-between">
                  <span className="text-green-400">Take Profit 2</span>
                  <span className="text-green-400 font-semibold">
                    {price(signal.tp2)}
                  </span>
                </div>
              )}
              <hr className="border-slate-800" />
              <div className="flex justify-between">
                <span className="text-slate-400">R:R Ratio</span>
                <span
                  className={`font-bold ${
                    signal.rrRatio >= 2
                      ? "text-green-400"
                      : signal.rrRatio >= 1.5
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  1:{signal.rrRatio} ✓
                </span>
              </div>
            </div>
          </div>

          {/* Position sizing */}
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">
              Position Sizing
            </h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Account Size</span>
                <span className="text-slate-200">
                  {formatCurrency(accountSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Risk ({riskPct}%)</span>
                <span className="text-yellow-400">
                  {formatCurrency(maxRiskDollars)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Position Size</span>
                <span className="text-cyan-400 font-bold">
                  {positionSize} shares
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dollar Risk</span>
                <span
                  className={`font-semibold ${
                    dollarRisk <= maxRiskDollars
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(dollarRisk)}
                  {dollarRisk <= maxRiskDollars ? " ✓" : " ✗"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI reasoning + Robinhood checklist */}
        <div className="space-y-5">
          {/* AI reasoning */}
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-3">
              🤖 AI Reasoning
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {signal.aiReasoning}
            </p>
          </div>

          {/* Robinhood checklist */}
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-3">
              📱 Robinhood Execution Checklist
            </h2>
            <ol className="space-y-2">
              {robinhoodSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-cyan-400 font-mono text-xs mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-slate-400">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Approve/Skip buttons */}
      <div className="mt-6">
        <ApproveSkipButtons signalId={signal.id} ticker={signal.ticker} />
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner mt-5 text-center">
        ⚠️ AI-generated decision support only. Not financial advice. All trades are your responsibility.
        Signal Guard AI never places trades automatically.
      </div>
    </div>
  );
}
