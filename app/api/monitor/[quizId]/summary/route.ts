import { NextResponse } from "next/server";
import { getMonitorSummary } from "@/lib/attempt/helpers/getMonitorData";
import { requireQuizCreator } from "@/lib/monitor/requireQuizCreator";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;
  const auth = await requireQuizCreator(quizId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const data = await getMonitorSummary(quizId);
  const rawStartedAt = data?.meta?.startedAt ?? null;
  let startedAtDate: Date | null = null;
  if (rawStartedAt) {
    if (typeof rawStartedAt === "string" && !/[zZ]|[+-]\d{2}:\d{2}$/.test(rawStartedAt)) {
      startedAtDate = new Date(`${rawStartedAt}Z`);
    } else {
      startedAtDate = new Date(rawStartedAt);
    }
    if (Number.isNaN(startedAtDate.getTime())) {
      startedAtDate = null;
    }
  }

  const dateKey = startedAtDate
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(startedAtDate)
    : null;
  const nowKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const timePart = startedAtDate
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(startedAtDate)
    : null;

  const datePart = startedAtDate
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(startedAtDate)
    : null;

  const startedAtDisplay = startedAtDate
    ? (dateKey === nowKey ? `Today at ${timePart}` : `${datePart} at ${timePart}`)
    : null;

  return NextResponse.json({
    ...data,
    meta: {
      ...data.meta,
      startedAt: startedAtDate ? startedAtDate.toISOString() : null,
      startedAtDisplay,
    },
  });
}
