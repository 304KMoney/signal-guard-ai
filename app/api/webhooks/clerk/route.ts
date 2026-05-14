import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkUserCreatedEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkUserCreatedEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (evt.type === "user.created") {
    const { id: clerkId, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address || "";

    try {
      await prisma.user.upsert({
        where: { clerkId },
        update: { email },
        create: {
          clerkId,
          email,
          accountSize: 150, // default $150
          maxDailyLossPct: 2.0,
          maxPositionSizePct: 10.0,
          tradingMode: "PAPER",
        },
      });

      console.log(`User created: ${clerkId} (${email})`);
    } catch (err) {
      console.error("Failed to create user in DB:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
