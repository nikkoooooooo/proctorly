"use server"

import { db } from "@/lib/db"
import { attempt, quiz, user as userTable } from "@/lib/schema"
import { eq } from "drizzle-orm"

/**
 * Get final result for a given attemptId
 */
export async function getFinalResultsAction(attemptId: string) {
  // 1️⃣ Fetch the attempt
  const [userAttempt] = await db
    .select({
      id: attempt.id,
      score: attempt.score,
      quizId: attempt.quizId,
      tabSwitchCount: attempt.tabSwitchCount,
    })
    .from(attempt)
    .where(eq(attempt.id, attemptId))
    .execute()

  if (!userAttempt) throw new Error("Attempt not found")

  // 2️⃣ Fetch quiz title and creator
  const [quizData] = await db
    .select({
      title: quiz.title,
      creatorId: quiz.creatorId,
    })
    .from(quiz)
    .where(eq(quiz.id, userAttempt.quizId))
    .execute()

  if (!quizData) throw new Error("Quiz not found")

  // 3️⃣ Fetch creator name
  const [creator] = await db
    .select({ name: userTable.name })
    .from(userTable)
    .where(eq(userTable.id, quizData.creatorId))
    .execute()

  return {
    score: userAttempt.score ?? 0,
    tabSwitchCount: userAttempt.tabSwitchCount ?? 0,
    quizTitle: quizData.title,
    quizAuthor: creator?.name ?? "Unknown",
  }
}
