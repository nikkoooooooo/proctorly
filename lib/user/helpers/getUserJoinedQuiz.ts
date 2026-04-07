"use server"

import { db } from "@/lib/db"
import { eq } from "drizzle-orm";
import { quiz, user, quizEnrollment } from "@/lib/schema";
import { getRetakeSummaries } from "@/lib/attempt/helpers/getRetakeSummary";




export async function getUserJoinedQuiz(userId: string) {
  const joined = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      joinCode: quiz.joinCode,
      description: quiz.description,
      createdAt: quiz.createdAt,
      expiresAt: quiz.expiresAt,
      isPaidQuiz: quiz.isPaidQuiz,
      paidQuizFee: quiz.paidQuizFee,
      retakeLimit: quiz.retakeLimit,
      creatorName: user.name,
    })
    .from(quizEnrollment)
    .innerJoin(quiz, eq(quizEnrollment.quizId, quiz.id))
    .innerJoin(user, eq(user.id, quiz.creatorId))
    .where(eq(quizEnrollment.userId, userId))
    .execute();

  if (!joined.length) return joined;

  const quizIds = joined.map((row) => row.id);
  const summaries = await getRetakeSummaries({ userId, quizIds })

  return joined.map((row) => {
    const summary = summaries[row.id]
    const attemptStatus = !summary
      ? "not_started"
      : summary.latestAttemptCompleted
        ? "completed"
        : "in_progress";

    return {
      ...row,
      attemptStatus,
      attemptId: summary?.latestAttemptId ?? null,
      attemptCount: summary?.attemptCount ?? 0,
    };
  });
}
