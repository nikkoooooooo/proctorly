import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-actions";
import { db } from "@/lib/db";
import { attempt, attemptEvent } from "@/lib/schema";

const allowedTypes = new Set([
  "answered",
  "tab_blur",
  "tab_focus",
  "submit",
  "disconnect",
  "heartbeat",
  "auto_fail",
]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const { attemptId } = await params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as string | undefined;
  const payload = body?.payload ?? null;

  if (!type || !allowedTypes.has(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const [currentAttempt] = await db
    .select({ id: attempt.id, userId: attempt.userId })
    .from(attempt)
    .where(eq(attempt.id, attemptId));

  if (!currentAttempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  if (currentAttempt.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();

  if (type !== "heartbeat") {
    await db.insert(attemptEvent).values({
      id: randomUUID(),
      attemptId,
      type,
      payload,
    });

    await db
      .update(attempt)
      .set({ lastSeenAt: now, lastActivityAt: now })
      .where(eq(attempt.id, attemptId));
  } else {
    await db
      .update(attempt)
      .set({ lastSeenAt: now })
      .where(eq(attempt.id, attemptId));
  }

  return NextResponse.json({ ok: true });
}
