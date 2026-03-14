import { NextResponse } from "next/server";
import { getMonitorTable } from "@/lib/attempt/helpers/getMonitorData";
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

  const rows = await getMonitorTable(quizId);
  return NextResponse.json({ rows });
}
