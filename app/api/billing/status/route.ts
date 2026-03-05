import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-actions";
import { subscription } from "@/lib/schema";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ isPaid: false, label: null }, { status: 200 });
  }

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.userId));

  const isExpired =
    sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();
  const isActive = sub?.status === "active" && !isExpired;

  if (!isActive || !sub?.planId || sub.planId === "free") {
    return NextResponse.json({ isPaid: false, label: null }, { status: 200 });
  }

  const label = sub.planId === "early_access" ? "Early Access" : "Premium";
  return NextResponse.json({ isPaid: true, label }, { status: 200 });
}
