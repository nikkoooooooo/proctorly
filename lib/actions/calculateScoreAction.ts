"use server"

import { db } from "@/lib/db"
import { attempt, attemptAnswer, question } from "@/lib/schema"
import { eq } from "drizzle-orm"

/**
 * Calculate the final quiz score based on attempt answers
 */
export async function calculateScoreAction(attemptId: string) {
  // Get all answers for this attempt
  const answers = await db
    .select()
    .from(attemptAnswer)
    .where(eq(attemptAnswer.attemptId, attemptId))
    .execute()

  if (!answers || answers.length === 0) {
    throw new Error("No answers found for this attempt.")
  }

  // Count correct = isCorrect === true
  const totalCorrect = answers.filter(a => a.isCorrect === true).length
  const totalQuestions = answers.length

  const score = totalCorrect

  // Update attempt score + set completed status
  await db
    .update(attempt)
    .set({
      score: score,
      isCompleted: true,
      submittedAt: new Date(),
    })
    .where(eq(attempt.id, attemptId))
    .execute()

  return {
    totalCorrect,
    totalQuestions,
    score,
  }
}
