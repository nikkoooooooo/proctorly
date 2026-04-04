"use server"

import { db } from "@/lib/db"
import { desc, eq, inArray } from "drizzle-orm";
import { attempt, quiz, user, quizEnrollment } from "@/lib/schema";




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
      creatorName: user.name,
    })
    .from(quizEnrollment)
    .innerJoin(quiz, eq(quizEnrollment.quizId, quiz.id))
    .innerJoin(user, eq(user.id, quiz.creatorId))
    .where(eq(quizEnrollment.userId, userId))
    .execute();

  if (!joined.length) return joined;

  const quizIds = joined.map((row) => row.id);
  const attempts = await db
    .select({
      quizId: attempt.quizId,
      attemptId: attempt.id,
      isCompleted: attempt.isCompleted,
      updatedAt: attempt.updatedAt,
    })
    .from(attempt)
    .where(inArray(attempt.quizId, quizIds))
    .orderBy(desc(attempt.updatedAt))
    .execute();

  const latestByQuiz = new Map<
    string,
    { attemptId: string; isCompleted: boolean }
  >();
  for (const row of attempts) {
    if (!latestByQuiz.has(row.quizId)) {
      latestByQuiz.set(row.quizId, {
        attemptId: row.attemptId,
        isCompleted: row.isCompleted,
      });
    }
  }

  return joined.map((row) => {
    const latest = latestByQuiz.get(row.id);
    const attemptStatus = !latest
      ? "not_started"
      : latest.isCompleted
        ? "completed"
        : "in_progress";

    return {
      ...row,
      attemptStatus,
      attemptId: latest?.attemptId ?? null,
    };
  });
}


