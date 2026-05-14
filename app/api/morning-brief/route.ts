import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMorningBrief } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body as { answers: Record<string, string> };

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock market data (in production, pull from Yahoo Finance / CoinGecko)
    const mockMarketData = {
      spyPremarket: 0.42,
      qqqPremarket: 0.61,
      btc24h: -1.2,
      eth24h: -0.8,
      vix: 16.3,
      events: ["2:00 PM — FOMC Minutes"],
    };

    const result = await generateMorningBrief(
      answers,
      mockMarketData,
      user.accountSize.toNumber(),
      user.tradingMode,
      user.anthropicApiKey ?? undefined
    );

    // Save to DB
    await prisma.morningBrief.create({
      data: {
        userId: user.id,
        checkInAnswers: answers,
        aiNarrative: result.narrative,
        marketBias: result.marketBias,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Morning brief error:", error);
    return NextResponse.json(
      { error: "Failed to generate morning brief" },
      { status: 500 }
    );
  }
}
