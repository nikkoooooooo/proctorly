"use server"

import { db } from "@/lib/db"
import { attempt, attemptAnswer } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function calculateScoreAction(attemptId: string) {
  try {
    // Get all answers
    const answers = await db
      .select()
      .from(attemptAnswer)
      .where(eq(attemptAnswer.attemptId, attemptId))
      .execute()

    if (!answers || answers.length === 0) {
      return { success: false, error: "No answers found for this attempt." }
    }

    const totalCorrect = answers.filter(a => a.isCorrect).length
    const totalQuestions = answers.length
    const score = totalCorrect

    // Update attempt
    await db
      .update(attempt)
      .set({
        score,
        isCompleted: true,
        submittedAt: new Date(),
      })
      .where(eq(attempt.id, attemptId))
      .execute()

    return { success: true, totalCorrect, totalQuestions, score }
  } catch (error) {
    console.error("Failed to calculate score:", error)
    return { success: false, error: (error as Error).message }
  }
}
