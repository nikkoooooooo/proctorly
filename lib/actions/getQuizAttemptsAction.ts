// lib/actions/getQuizAttemptsAction.ts
"use server"

import { db } from "@/lib/db"
import { attempt, user as userTable } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function getQuizAttemptsAction(quizId: string) {
  // fetch all attempts for a specific quiz
  const results = await db
    .select({
      attemptId: attempt.id,
      userId: attempt.userId,
      score: attempt.score,
      tabSwitchCount: attempt.tabSwitchCount,
      completed: attempt.isCompleted,
      name: userTable.name, // join user name
      email: userTable.email,
    })
    .from(attempt)
    .leftJoin(userTable, eq(userTable.id, attempt.userId))
    .where(eq(attempt.quizId, quizId))
    .orderBy(attempt.startedAt)
    .execute()

  return results
}
