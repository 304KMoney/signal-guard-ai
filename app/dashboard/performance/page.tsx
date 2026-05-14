import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getPnLColor } from "@/lib/utils";
import Link from "next/link";

export default async function PerformancePage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const trades = await prisma.trade.findMany({
    where: { userId: user?.id ?? "", status: "CLOSED" },
    orderBy: { entryAt: "asc" },
  });

  const accountSize = user?.accountSize?.toNumber() ?? 150;

  // Calculate stats
  const wins = trades.filter((t) => (t.pnl?.toNumber() ?? 0) > 0);
  const losses = trades.filter((t) => (t.pnl?.toNumber() ?? 0) < 0);
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl?.toNumber() ?? 0), 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

  const avgWin =
    wins.length > 0
      ? wins.reduce((sum, t) => sum + (t.pnl?.toNumber() ?? 0), 0) / wins.length
      : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(
          losses.reduce((sum, t) => sum + (t.pnl?.toNumber() ?? 0), 0) /
            losses.length
        )
      : 0;

  const profitFactor =
    losses.length > 0 && avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;

  const bestTrade = trades.reduce(
    (best, t) =>
      (t.pnl?.toNumber() ?? 0) > (best?.pnl?.toNumber() ?? -Infinity) ? t : best,
    trades[0]
  );
  const worstTrade = trades.reduce(
    (worst, t) =>
      (t.pnl?.toNumber() ?? 0) < (worst?.pnl?.toNumber() ?? Infinity) ? t : worst,
    trades[0]
  );

  // Paper vs Live breakdown
  const paperTrades = trades.filter((t) => t.mode === "PAPER");
  const liveTrades = trades.filter((t) => t.mode === "LIVE");
  const paperPnL = paperTrades.reduce((s, t) => s + (t.pnl?.toNumber() ?? 0), 0);
  const livePnL = liveTrades.reduce((s, t) => s + (t.pnl?.toNumber() ?? 0), 0);

  // Cumulative P&L for chart (simplified)
  let running = 0;
  const chartData = trades.map((t) => {
    running += t.pnl?.toNumber() ?? 0;
    return {
      date: t.entryAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pnl: running,
    };
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">📈 Performance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Based on {trades.length} closed trades
        </p>
      </div>

      {trades.length === 0 ? (
        <div className="terminal-card p-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No completed trades yet
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Close some trades in your journal to see performance stats.
          </p>
          <Link href="/dashboard/journal/new" className="btn-primary text-sm">
            Log a Trade
          </Link>
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total P&L",
                value: formatCurrency(totalPnL),
                color: totalPnL >= 0 ? "text-green-400" : "text-red-400",
                sub: `${((totalPnL / accountSize) * 100).toFixed(1)}% of account`,
              },
              {
                label: "Win Rate",
                value: `${winRate.toFixed(1)}%`,
                color: winRate >= 50 ? "text-green-400" : "text-yellow-400",
                sub: `${wins.length}W / ${losses.length}L`,
              },
              {
                label: "Profit Factor",
                value: profitFactor.toFixed(2),
                color:
                  profitFactor >= 1.5
                    ? "text-green-400"
                    : profitFactor >= 1
                    ? "text-yellow-400"
                    : "text-red-400",
                sub: profitFactor >= 1.5 ? "Excellent" : profitFactor >= 1 ? "Break-even+" : "Net loss",
              },
              {
                label: "Avg Win / Avg Loss",
                value: `${formatCurrency(avgWin)} / ${formatCurrency(avgLoss)}`,
                color: avgWin > avgLoss ? "text-green-400" : "text-red-400",
                sub: avgWin > 0 && avgLoss > 0 ? `R:R ${(avgWin / avgLoss).toFixed(2)}x` : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="terminal-card p-4">
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-lg font-bold font-mono ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Best/Worst + Paper vs Live */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Best/Worst */}
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-4">
                Best & Worst Trades
              </h2>
              {bestTrade && (
                <div className="mb-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-green-400 font-mono font-bold">
                        BEST: {bestTrade.ticker}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {bestTrade.direction}
                      </span>
                    </div>
                    <span className="text-green-400 font-mono font-bold">
                      +{formatCurrency(bestTrade.pnl?.toNumber() ?? 0)}
                    </span>
                  </div>
                </div>
              )}
              {worstTrade && worstTrade.id !== bestTrade?.id && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-red-400 font-mono font-bold">
                        WORST: {worstTrade.ticker}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {worstTrade.direction}
                      </span>
                    </div>
                    <span className="text-red-400 font-mono font-bold">
                      {formatCurrency(worstTrade.pnl?.toNumber() ?? 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Paper vs Live */}
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-4">
                Paper vs Live Breakdown
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-blue-400 font-semibold">
                        PAPER
                      </p>
                      <p className="text-xs text-slate-500">
                        {paperTrades.length} trades
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold ${getPnLColor(paperPnL)}`}
                    >
                      {paperPnL >= 0 ? "+" : ""}
                      {formatCurrency(paperPnL)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold">
                        LIVE
                      </p>
                      <p className="text-xs text-slate-500">
                        {liveTrades.length} trades
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold ${getPnLColor(livePnL)}`}
                    >
                      {livePnL >= 0 ? "+" : ""}
                      {formatCurrency(livePnL)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* P&L over time — simple text-based chart */}
          {chartData.length > 1 && (
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-4">
                Cumulative P&L
              </h2>
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 h-32 min-w-max">
                  {chartData.map((d, i) => {
                    const maxAbs = Math.max(
                      ...chartData.map((x) => Math.abs(x.pnl))
                    );
                    const height = maxAbs > 0 ? (Math.abs(d.pnl) / maxAbs) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1"
                        title={`${d.date}: ${formatCurrency(d.pnl)}`}
                      >
                        <span className={`text-xs font-mono ${getPnLColor(d.pnl)}`}>
                          {d.pnl >= 0 ? "+" : ""}
                          {d.pnl.toFixed(0)}
                        </span>
                        <div
                          className={`w-6 rounded-t ${
                            d.pnl >= 0 ? "bg-green-500/60" : "bg-red-500/60"
                          }`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[9px] text-slate-600">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
