import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-actions";
import { plan, subscription, user as userTable } from "@/lib/schema";
import { createPaymongoLink } from "@/lib/billing/paymongo";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId || typeof planId !== "string") {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const [planRow] = await db.select().from(plan).where(eq(plan.id, planId));
    if (!planRow) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (planRow.id === "free") {
      return NextResponse.json(
        { error: "Free plan does not require checkout" },
        { status: 400 }
      );
    }

    const [userRow] = await db
      .select({ id: userTable.id, name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, session.userId));

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const checkout = await createPaymongoLink({
      amount: planRow.price,
      description: `${planRow.name} Subscription`,
      remarks: `Plan ${planRow.id} for ${userRow.email}`,
      currency: planRow.currency,
    });

    const [existing] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.userId));

    if (existing) {
      await db
        .update(subscription)
        .set({
          planId: planRow.id,
          status: "inactive",
        paymongoCustomerId: null,
        paymongoSubscriptionId: null,
        paymongoLinkId: checkout.linkId,
        paymongoLinkReference: checkout.referenceNumber,
      })
      .where(eq(subscription.userId, session.userId));
    } else {
      await db.insert(subscription).values({
        id: crypto.randomUUID(),
        userId: session.userId,
        planId: planRow.id,
        status: "inactive",
        paymongoCustomerId: null,
        paymongoSubscriptionId: null,
        paymongoLinkId: checkout.linkId,
        paymongoLinkReference: checkout.referenceNumber,
      });
    }

    return NextResponse.json({
      linkId: checkout.linkId,
      status: checkout.status,
      checkoutUrl: checkout.checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
