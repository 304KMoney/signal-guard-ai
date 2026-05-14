import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateStrategySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  rules: z.object({
    entryRules: z.array(z.string()).optional().default([]),
    exitRules: z.array(z.string()).optional().default([]),
    whenNotToTrade: z.array(z.string()).optional().default([]),
  }),
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateStrategySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid strategy data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const strategy = await prisma.strategy.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        rules: parsed.data.rules,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json(strategy, { status: 201 });
  } catch (error) {
    console.error("Create strategy error:", error);
    return NextResponse.json({ error: "Failed to create strategy" }, { status: 500 });
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
      return NextResponse.json([]);
    }

    const strategies = await prisma.strategy.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(strategies);
  } catch (error) {
    console.error("Fetch strategies error:", error);
    return NextResponse.json({ error: "Failed to fetch strategies" }, { status: 500 });
  }
}
