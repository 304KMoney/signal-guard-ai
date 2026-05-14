import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignalById } from "@/lib/mock-signals";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const signal = getSignalById(id);

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log as pending trade in journal
    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        ticker: signal.ticker,
        direction: signal.direction,
        market: signal.market,
        entryPrice: signal.entryLow,
        stopLoss: signal.stopLoss,
        target: signal.tp1,
        size: 1, // placeholder — user sets actual size in Robinhood
        mode: user.tradingMode,
        status: "OPEN",
        notes: `Approved from Signal Scanner. Signal ID: ${signal.id}. Score: ${signal.score}/100. Type: ${signal.signalType}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trade approved and logged to journal",
      tradeId: trade.id,
    });
  } catch (error) {
    console.error("Approve signal error:", error);
    return NextResponse.json({ error: "Failed to approve signal" }, { status: 500 });
  }
}
