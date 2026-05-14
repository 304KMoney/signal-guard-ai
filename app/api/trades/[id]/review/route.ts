import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEODReview } from "@/lib/claude";

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
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trade = await prisma.trade.findFirst({
      where: { id, userId: user.id },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Generate AI review
    const result = await generateEODReview(
      {
        ticker: trade.ticker,
        direction: trade.direction,
        entryPrice: trade.entryPrice.toNumber(),
        exitPrice: trade.exitPrice?.toNumber(),
        stopLoss: trade.stopLoss.toNumber(),
        target: trade.target.toNumber(),
        pnl: trade.pnl?.toNumber(),
        notes: trade.notes,
        size: trade.size.toNumber(),
        mode: trade.mode,
      },
      user.anthropicApiKey ?? undefined
    );

    // Save review
    const review = await prisma.eODReview.create({
      data: {
        userId: user.id,
        tradeId: trade.id,
        aiNarrative: result.narrative,
        lessonsLearned: result.lessonsLearned,
      },
    });

    return NextResponse.json({
      ...review,
      disclaimer: result.disclaimer,
    });
  } catch (error) {
    console.error("EOD review error:", error);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
