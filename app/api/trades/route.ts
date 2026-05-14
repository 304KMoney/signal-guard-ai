import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateTradeSchema = z.object({
  ticker: z.string().min(1).max(20),
  direction: z.enum(["LONG", "SHORT"]),
  entryPrice: z.union([z.string(), z.number()]).transform(Number),
  stopLoss: z.union([z.string(), z.number()]).transform(Number),
  target: z.union([z.string(), z.number()]).transform(Number),
  size: z.union([z.string(), z.number()]).transform(Number),
  market: z.enum(["STOCK", "CRYPTO", "FUTURES"]),
  mode: z.enum(["PAPER", "LIVE"]),
  notes: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).default("OPEN"),
  exitPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  pnl: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  signalId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateTradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid trade data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = parsed.data;
    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        ticker: data.ticker,
        direction: data.direction,
        market: data.market,
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        target: data.target,
        size: data.size,
        mode: data.mode,
        status: data.status,
        notes: data.notes,
        exitPrice: data.exitPrice,
        pnl: data.pnl,
        signalId: data.signalId,
      },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("Create trade error:", error);
    return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryAt: "desc" },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error("Fetch trades error:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}
