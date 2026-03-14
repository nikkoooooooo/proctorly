import { getSession } from "@/lib/auth-actions";
import { db } from "@/lib/db";
import { quiz } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function requireQuizCreator(quizId: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const [q] = await db.select().from(quiz).where(eq(quiz.id, quizId));
  if (!q) {
    return { ok: false as const, status: 404, error: "Quiz not found" };
  }

  if (q.creatorId !== session.userId) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, quiz: q, userId: session.userId };
}
