import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id, status: "CLOSED" },
      orderBy: { entryAt: "asc" },
    });

    const wins = trades.filter((t) => (t.pnl?.toNumber() ?? 0) > 0);
    const losses = trades.filter((t) => (t.pnl?.toNumber() ?? 0) < 0);
    const totalPnL = trades.reduce((s, t) => s + (t.pnl?.toNumber() ?? 0), 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

    const avgWin =
      wins.length > 0
        ? wins.reduce((s, t) => s + (t.pnl?.toNumber() ?? 0), 0) / wins.length
        : 0;
    const avgLoss =
      losses.length > 0
        ? Math.abs(
            losses.reduce((s, t) => s + (t.pnl?.toNumber() ?? 0), 0) /
              losses.length
          )
        : 0;

    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
    const profitFactor =
      losses.length > 0 && avgLoss > 0
        ? (avgWin * wins.length) / (avgLoss * losses.length)
        : 0;

    const bestTrade =
      trades.length > 0
        ? trades.reduce((b, t) =>
            (t.pnl?.toNumber() ?? 0) > (b.pnl?.toNumber() ?? -Infinity) ? t : b
          )
        : null;

    const worstTrade =
      trades.length > 0
        ? trades.reduce((w, t) =>
            (t.pnl?.toNumber() ?? 0) < (w.pnl?.toNumber() ?? Infinity) ? t : w
          )
        : null;

    return NextResponse.json({
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnL,
      avgWin,
      avgLoss,
      avgRR,
      profitFactor,
      bestTrade: bestTrade
        ? { ticker: bestTrade.ticker, pnl: bestTrade.pnl?.toNumber() }
        : null,
      worstTrade: worstTrade
        ? { ticker: worstTrade.ticker, pnl: worstTrade.pnl?.toNumber() }
        : null,
    });
  } catch (error) {
    console.error("Performance error:", error);
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 });
  }
}
