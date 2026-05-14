import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
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
      include: { eodReviews: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Fetch trade error:", error);
    return NextResponse.json({ error: "Failed to fetch trade" }, { status: 500 });
  }
}
