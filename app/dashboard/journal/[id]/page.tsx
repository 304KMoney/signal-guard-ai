import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDateTime, getPnLColor } from "@/lib/utils";
import Link from "next/link";
import EODReviewButton from "./EODReviewButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TradeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const trade = await prisma.trade.findFirst({
    where: { id, userId: user?.id ?? "" },
    include: { eodReviews: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!trade) notFound();

  const latestReview = trade.eodReviews[0];
  const pnl = trade.pnl?.toNumber() ?? null;
  const entry = trade.entryPrice.toNumber();
  const stop = trade.stopLoss.toNumber();
  const target = trade.target.toNumber();
  const exit = trade.exitPrice?.toNumber();
  const size = trade.size.toNumber();

  const rr = Math.abs(target - entry) / Math.abs(entry - stop);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/dashboard/journal"
          className="text-slate-500 hover:text-slate-300 text-sm"
        >
          ← Back to Journal
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-slate-200">
              {trade.ticker}
            </h1>
            <span
              className={`font-bold text-sm ${
                trade.direction === "LONG" ? "text-green-400" : "text-red-400"
              }`}
            >
              {trade.direction}
            </span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              {trade.market}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                trade.mode === "PAPER"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {trade.mode}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {formatDateTime(trade.entryAt)}
          </p>
        </div>
        {pnl !== null && (
          <div className="text-right">
            <p className={`text-2xl font-bold font-mono ${getPnLColor(pnl)}`}>
              {pnl >= 0 ? "+" : ""}
              {formatCurrency(pnl)}
            </p>
            <p className="text-xs text-slate-500">P&L</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade details */}
        <div className="space-y-5">
          <div className="terminal-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">Trade Levels</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Entry Price</span>
                <span className="text-slate-200">${entry.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Stop Loss</span>
                <span className="text-red-400">${stop.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Target</span>
                <span className="text-green-400">${target.toFixed(4)}</span>
              </div>
              {exit !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Exit Price</span>
                  <span className="text-slate-300">${exit.toFixed(4)}</span>
                </div>
              )}
              <hr className="border-slate-800" />
              <div className="flex justify-between">
                <span className="text-slate-500">Size</span>
                <span className="text-cyan-400">{size} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">R:R (planned)</span>
                <span
                  className={
                    rr >= 2
                      ? "text-green-400"
                      : rr >= 1.5
                      ? "text-yellow-400"
                      : "text-red-400"
                  }
                >
                  1:{rr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={
                    trade.status === "OPEN"
                      ? "text-cyan-400"
                      : trade.status === "CLOSED"
                      ? "text-slate-400"
                      : "text-red-400"
                  }
                >
                  {trade.status}
                </span>
              </div>
            </div>
          </div>

          {trade.notes && (
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-3">Notes</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {trade.notes}
              </p>
            </div>
          )}
        </div>

        {/* AI EOD Review */}
        <div className="space-y-5">
          {latestReview ? (
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-3">
                🤖 AI Trade Review
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    Assessment
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {latestReview.aiNarrative}
                  </p>
                </div>
                <hr className="border-slate-800" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    Lessons Learned
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                    {latestReview.lessonsLearned}
                  </p>
                </div>
                <div className="disclaimer-banner text-xs">
                  ⚠️ AI-generated review. Not financial advice.
                </div>
              </div>
            </div>
          ) : (
            <div className="terminal-card p-5">
              <h2 className="font-semibold text-slate-200 mb-3">
                📝 EOD AI Review
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Get an AI-powered review of this trade. What went well? What
                could be improved? What lessons can you take forward?
              </p>
              <EODReviewButton tradeId={trade.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
