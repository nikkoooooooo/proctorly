import { NextResponse } from "next/server";
import { getMonitorEvents } from "@/lib/attempt/helpers/getMonitorData";
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

  const { searchParams } = new URL(_req.url);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 20;

  const events = await getMonitorEvents(quizId, limit);
  return NextResponse.json({ events });
}
