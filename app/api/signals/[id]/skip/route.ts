import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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

    // In production, log the skip to track discipline
    return NextResponse.json({
      success: true,
      message: "Signal skipped. Staying disciplined.",
    });
  } catch (error) {
    console.error("Skip signal error:", error);
    return NextResponse.json({ error: "Failed to skip signal" }, { status: 500 });
  }
}
