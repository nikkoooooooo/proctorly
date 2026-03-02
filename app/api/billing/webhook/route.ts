import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription, webhookEvent, user as userTable } from "@/lib/schema";
import { verifyPaymongoSignature } from "@/lib/billing/paymongo";
import { getManilaMonthBounds } from "@/lib/billing/period";

type PaymongoEventPayload = {
  data?: {
    id?: string;
    attributes?: {
      type?: string;
      data?: {
        id?: string;
        type?: string;
        attributes?: {
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
        };
        relationships?: {
          subscription?: {
            data?: {
              id?: string;
            };
          };
        };
      };
    };
  };
};

function extractSubscriptionId(payload: PaymongoEventPayload) {
  const resource = payload.data?.attributes?.data;
  if (resource?.type === "subscription" && resource.id) {
    return resource.id;
  }
  return resource?.relationships?.subscription?.data?.id || null;
}

function mapStatus(eventType: string | undefined, resourceStatus?: string) {
  if (!eventType) return null;
  if (eventType === "subscription.activated") return "active";
  if (eventType === "subscription.past_due") return "past_due";
  if (eventType === "subscription.unpaid") return "past_due";
  if (eventType === "subscription.invoice.payment_failed") return "past_due";
  if (eventType === "subscription.invoice.paid") return "active";
  if (eventType === "link.payment.paid") return "active";

  if (eventType === "subscription.updated" && resourceStatus) {
    const normalized = resourceStatus.toLowerCase();
    if (normalized.includes("cancel")) return "canceled";
    if (normalized.includes("active")) return "active";
    if (normalized.includes("past_due")) return "past_due";
  }

  return null;
}

function computePeriodEnd(now: Date) {
  const { end } = getManilaMonthBounds(now);
  return end;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature") || "";

  if (!signature || !verifyPaymongoSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as PaymongoEventPayload;
  const eventId = payload.data?.id;
  const eventType = payload.data?.attributes?.type;

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(webhookEvent)
    .where(eq(webhookEvent.eventId, eventId));
  if (existing) {
    return NextResponse.json({ ok: true });
  }

  await db.insert(webhookEvent).values({
    id: crypto.randomUUID(),
    provider: "paymongo",
    eventId,
    type: eventType,
    payload,
  });

  const subscriptionId = extractSubscriptionId(payload);
  const linkId = payload.data?.attributes?.data?.id;
  if (!subscriptionId && !linkId) {
    return NextResponse.json({ ok: true });
  }

  const resource = payload.data?.attributes?.data;
  const mappedStatus = mapStatus(eventType, resource?.attributes?.status);

  const periodStart = resource?.attributes?.current_period_start
    ? new Date(resource.attributes.current_period_start)
    : undefined;
  const periodEnd = resource?.attributes?.current_period_end
    ? new Date(resource.attributes.current_period_end)
    : undefined;

  if (mappedStatus) {
    const now = new Date();
    const nextEnd =
      eventType === "link.payment.paid" ? computePeriodEnd(now) : periodEnd;

    const target = subscriptionId
      ? eq(subscription.paymongoSubscriptionId, subscriptionId)
      : eq(subscription.paymongoLinkId, linkId || "");

    await db
      .update(subscription)
      .set({
        status: mappedStatus,
        currentPeriodStart:
          eventType === "link.payment.paid" ? now : periodStart,
        currentPeriodEnd: nextEnd,
      })
      .where(target);

    const [updated] = await db
      .select({ userId: subscription.userId, planId: subscription.planId })
      .from(subscription)
      .where(target);

    if (updated?.userId) {
      await db
        .update(userTable)
        .set({
          planId: mappedStatus === "active" ? updated.planId : "free",
          subscriptionStatus: mappedStatus,
        })
        .where(eq(userTable.id, updated.userId));
    }
  }

  return NextResponse.json({ ok: true });
}
