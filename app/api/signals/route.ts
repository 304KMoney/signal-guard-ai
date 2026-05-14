import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSignalsWithLivePrices } from "@/lib/mock-signals";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signals = await getSignalsWithLivePrices();
    const qualified = signals.filter((s) => s.score >= 70).slice(0, 3);

    return NextResponse.json({ signals: qualified, all: signals });
  } catch (error) {
    console.error("Signals error:", error);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
