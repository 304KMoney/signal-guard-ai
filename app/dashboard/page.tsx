import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDateTime, getPnLColor, getScoreBadge } from "@/lib/utils";
import { getMarketBiasStyle, MOCK_SIGNALS } from "@/lib/mock-signals";

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [latestBrief, recentTrades, openTrades] = await Promise.all([
    prisma.morningBrief.findFirst({
      where: { userId: user?.id ?? "" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trade.findMany({
      where: { userId: user?.id ?? "" },
      orderBy: { entryAt: "desc" },
      take: 5,
    }),
    prisma.trade.findMany({
      where: { userId: user?.id ?? "", status: "OPEN" },
    }),
  ]);

  // Performance stats
  const allTrades = await prisma.trade.findMany({
    where: { userId: user?.id ?? "", status: "CLOSED" },
    select: { pnl: true },
  });

  const wins = allTrades.filter((t) => (t.pnl?.toNumber() ?? 0) > 0).length;
  const totalPnL = allTrades.reduce(
    (sum, t) => sum + (t.pnl?.toNumber() ?? 0),
    0
  );
  const winRate =
    allTrades.length > 0 ? (wins / allTrades.length) * 100 : 0;

  // Today's P&L
  const todayTrades = await prisma.trade.findMany({
    where: {
      userId: user?.id ?? "",
      status: "CLOSED",
      exitAt: { gte: today },
    },
    select: { pnl: true },
  });
  const todayPnL = todayTrades.reduce(
    (sum, t) => sum + (t.pnl?.toNumber() ?? 0),
    0
  );

  return {
    user,
    latestBrief,
    recentTrades,
    openTrades,
    stats: {
      totalPnL,
      winRate,
      totalTrades: allTrades.length,
      todayPnL,
    },
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const { user, latestBrief, recentTrades, stats } = await getDashboardData(userId);

  const accountSize = user?.accountSize?.toNumber() ?? 150;
  const bias = latestBrief?.marketBias ?? "NEUTRAL";
  const biasStyle = getMarketBiasStyle(bias);
  const topSignals = MOCK_SIGNALS.filter((s) => s.score >= 70).slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/dashboard/morning-brief" className="btn-primary text-sm">
          🌅 Morning Brief
        </Link>
      </div>

      {/* Market Bias Banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border mb-6 ${biasStyle.bg}`}
      >
        <span className={`text-2xl font-bold ${biasStyle.text}`}>
          {biasStyle.emoji}
        </span>
        <div>
          <p className={`font-bold text-sm ${biasStyle.text}`}>
            MARKET BIAS: {biasStyle.label}
          </p>
          {latestBrief ? (
            <p className="text-xs text-slate-400">
              Based on today&apos;s morning brief
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Complete your morning brief for today&apos;s bias
            </p>
          )}
        </div>
        {!latestBrief && (
          <Link
            href="/dashboard/morning-brief"
            className="ml-auto text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 px-3 py-1 rounded"
          >
            Start Check-In →
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Portfolio Value",
            value: formatCurrency(accountSize + stats.totalPnL),
            sub: `${formatCurrency(accountSize)} starting`,
            color: "text-cyan-400",
          },
          {
            label: "Today's P&L",
            value: formatCurrency(stats.todayPnL),
            sub: "live + paper",
            color: stats.todayPnL >= 0 ? "text-green-400" : "text-red-400",
          },
          {
            label: "Win Rate",
            value: `${stats.winRate.toFixed(1)}%`,
            sub: `${stats.totalTrades} trades logged`,
            color: stats.winRate >= 50 ? "text-green-400" : "text-yellow-400",
          },
          {
            label: "Total P&L",
            value: formatCurrency(stats.totalPnL),
            sub: "all time",
            color: stats.totalPnL >= 0 ? "text-green-400" : "text-red-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="terminal-card p-4">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Signals */}
        <div className="terminal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200">Today&apos;s Top Signals</h2>
            <Link
              href="/dashboard/scanner"
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </Link>
          </div>
          {topSignals.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No signals ≥ 70 today. No-trade conditions may apply.
            </p>
          ) : (
            <div className="space-y-3">
              {topSignals.map((signal) => {
                const badge = getScoreBadge(signal.score);
                return (
                  <div
                    key={signal.id}
                    className="flex items-center gap-3 p-3 bg-[#0a0f1e] rounded-lg border border-slate-800"
                  >
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded border font-mono ${badge.color}`}
                    >
                      {signal.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-slate-200">
                          {signal.ticker}
                        </span>
                        <span className="text-xs text-slate-600">
                          {signal.market}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            signal.direction === "LONG"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {signal.direction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {signal.signalType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-mono">
                        R:R {signal.rrRatio}x
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/trade-plan/${signal.id}`}
                      className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap border border-cyan-400/30 px-2 py-1 rounded"
                    >
                      Plan →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Journal */}
        <div className="terminal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200">Recent Trades</h2>
            <Link
              href="/dashboard/journal"
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </Link>
          </div>
          {recentTrades.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-3">No trades logged yet</p>
              <Link href="/dashboard/journal/new" className="btn-primary text-xs">
                Log First Trade
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <Link
                  key={trade.id}
                  href={`/dashboard/journal/${trade.id}`}
                  className="flex items-center gap-3 p-3 bg-[#0a0f1e] rounded-lg border border-slate-800 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm text-slate-200">
                        {trade.ticker}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          trade.direction === "LONG"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.direction}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          trade.mode === "PAPER"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {trade.mode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {formatDateTime(trade.entryAt)}
                    </p>
                  </div>
                  {trade.pnl !== null && (
                    <span
                      className={`font-mono text-sm font-semibold ${getPnLColor(trade.pnl?.toNumber())}`}
                    >
                      {trade.pnl?.toNumber() >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl?.toNumber())}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${
                      trade.status === "OPEN"
                        ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/5"
                        : trade.status === "CLOSED"
                        ? "text-slate-400 border-slate-600 bg-slate-800"
                        : "text-red-400 border-red-400/30 bg-red-400/5"
                    }`}
                  >
                    {trade.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner mt-6 text-center">
        ⚠️ AI-generated decision support only. Not financial advice. All trades are your responsibility.
      </div>
    </div>
  );
}
