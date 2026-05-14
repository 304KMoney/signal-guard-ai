import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SettingsSchema = z.object({
  accountSize: z.number().min(10).max(1000000),
  maxDailyLossPct: z.number().min(0.1).max(50),
  maxPositionSizePct: z.number().min(1).max(100),
  tradingMode: z.enum(["PAPER", "LIVE"]),
  anthropicApiKey: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        accountSize: parsed.data.accountSize,
        maxDailyLossPct: parsed.data.maxDailyLossPct,
        maxPositionSizePct: parsed.data.maxPositionSizePct,
        tradingMode: parsed.data.tradingMode,
        anthropicApiKey: parsed.data.anthropicApiKey || null,
      },
      create: {
        clerkId: userId,
        email: userId + "@placeholder.com", // updated by webhook
        accountSize: parsed.data.accountSize,
        maxDailyLossPct: parsed.data.maxDailyLossPct,
        maxPositionSizePct: parsed.data.maxPositionSizePct,
        tradingMode: parsed.data.tradingMode,
        anthropicApiKey: parsed.data.anthropicApiKey || null,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({
        accountSize: 150,
        maxDailyLossPct: 2.0,
        maxPositionSizePct: 10.0,
        tradingMode: "PAPER",
        anthropicApiKey: "",
      });
    }

    return NextResponse.json({
      accountSize: user.accountSize.toNumber(),
      maxDailyLossPct: user.maxDailyLossPct.toNumber(),
      maxPositionSizePct: user.maxPositionSizePct.toNumber(),
      tradingMode: user.tradingMode,
      anthropicApiKey: user.anthropicApiKey ? "sk-ant-****" : "",
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
