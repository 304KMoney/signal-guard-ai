import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDate, getPnLColor } from "@/lib/utils";

export default async function JournalPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const trades = await prisma.trade.findMany({
    where: { userId: user?.id ?? "" },
    orderBy: { entryAt: "desc" },
  });

  const totalPnL = trades.reduce(
    (sum, t) => sum + (t.pnl?.toNumber() ?? 0),
    0
  );
  const closed = trades.filter((t) => t.status === "CLOSED");
  const wins = closed.filter((t) => (t.pnl?.toNumber() ?? 0) > 0).length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">📓 Trade Journal</h1>
          <p className="text-sm text-slate-500 mt-1">
            {trades.length} trades logged
          </p>
        </div>
        <Link href="/dashboard/journal/new" className="btn-primary text-sm">
          + Log Trade
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="terminal-card p-4">
          <p className="text-xs text-slate-500 mb-1">Total P&L</p>
          <p
            className={`text-xl font-bold font-mono ${
              totalPnL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {formatCurrency(totalPnL)}
          </p>
        </div>
        <div className="terminal-card p-4">
          <p className="text-xs text-slate-500 mb-1">Win Rate</p>
          <p
            className={`text-xl font-bold font-mono ${
              winRate >= 50 ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {winRate.toFixed(1)}%
          </p>
        </div>
        <div className="terminal-card p-4">
          <p className="text-xs text-slate-500 mb-1">Trades</p>
          <p className="text-xl font-bold font-mono text-cyan-400">
            {trades.length}
          </p>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="terminal-card p-16 text-center">
          <div className="text-4xl mb-4">📓</div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No trades logged yet
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Start journaling every trade — paper or live. Discipline starts with
            documentation.
          </p>
          <Link href="/dashboard/journal/new" className="btn-primary text-sm">
            Log Your First Trade
          </Link>
        </div>
      ) : (
        <div className="terminal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Ticker</th>
                  <th className="px-5 py-3 text-left font-medium">Direction</th>
                  <th className="px-5 py-3 text-left font-medium">Market</th>
                  <th className="px-5 py-3 text-right font-medium">Entry</th>
                  <th className="px-5 py-3 text-right font-medium">Exit</th>
                  <th className="px-5 py-3 text-right font-medium">Size</th>
                  <th className="px-5 py-3 text-right font-medium">P&L</th>
                  <th className="px-5 py-3 text-center font-medium">Mode</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="px-5 py-3 text-center font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {formatDate(trade.entryAt)}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-sm text-slate-200">
                      {trade.ticker}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-bold ${
                          trade.direction === "LONG"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {trade.market}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-sm text-slate-300">
                      ${trade.entryPrice.toString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-sm text-slate-400">
                      {trade.exitPrice ? `$${trade.exitPrice.toString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-sm text-slate-400">
                      {trade.size.toString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-semibold">
                      {trade.pnl !== null ? (
                        <span className={getPnLColor(trade.pnl?.toNumber())}>
                          {(trade.pnl?.toNumber() ?? 0) >= 0 ? "+" : ""}
                          {formatCurrency(trade.pnl?.toNumber() ?? 0)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          trade.mode === "PAPER"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {trade.mode}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          trade.status === "OPEN"
                            ? "text-cyan-400 border-cyan-400/30"
                            : trade.status === "CLOSED"
                            ? "text-slate-500 border-slate-700"
                            : "text-red-400 border-red-400/30"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Link
                        href={`/dashboard/journal/${trade.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
