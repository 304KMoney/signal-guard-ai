import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSignalById } from "@/lib/mock-signals";

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
    const signal = getSignalById(id);

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    return NextResponse.json(signal);
  } catch (error) {
    console.error("Signal fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch signal" }, { status: 500 });
  }
}
