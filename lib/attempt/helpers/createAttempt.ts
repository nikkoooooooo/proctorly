import { db } from "@/lib/db";
import { attempt, quiz } from "@/lib/schema";
import { eq, and } from "drizzle-orm/expressions";
import { randomUUID } from "crypto";

export async function createAttempt({ quizId, userId }: {quizId: string, userId: string}) {
  // 1️⃣ Check if attempt already exists
  const [existingAttempt] = await db
    .select()
    .from(attempt)
    .where(and(eq(attempt.quizId, quizId), eq(attempt.userId, userId)))
    .execute();

  if (existingAttempt) {
    return {
      status: "exists",
      attempt: existingAttempt,
    };
  }

  const [quizData] = await db
    .select({ expiresAt: quiz.expiresAt })
    .from(quiz)
    .where(eq(quiz.id, quizId))
    .execute();

  if (!quizData) {
    throw new Error("Quiz not found");
  }

  if (quizData.expiresAt && new Date() > new Date(quizData.expiresAt)) {
    return {
      status: "expired",
      expiresAt: quizData.expiresAt,
    };
  }

  // 2️⃣ Create new attempt
  const newAttempt = await db
    .insert(attempt)
    .values({
      id: randomUUID(),
      quizId,
      userId,
      score: 0,
      startedAt: new Date(),
    })
    .returning();

  return {
    status: "created",
    attempt: newAttempt[0],
  };
}
