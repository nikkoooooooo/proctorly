"use server"

import { db } from "@/lib/db"
import { attempt, quiz, quizPayment } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { createAttempt } from "../helpers/createAttempt"

export async function createAttemptAction({
  quizId,
  userId,
}: {
  quizId: string
  userId: string
}) {
  try {
    const [existingAttempt] = await db
      .select()
      .from(attempt)
      .where(and(eq(attempt.quizId, quizId), eq(attempt.userId, userId)))

    if (existingAttempt) {
      return { success: true, data: { status: "exists", attempt: existingAttempt } }
    }

    const [quizRow] = await db
      .select({ creatorId: quiz.creatorId, isPaidQuiz: quiz.isPaidQuiz })
      .from(quiz)
      .where(eq(quiz.id, quizId))

    if (!quizRow) {
      return { success: false, error: "Quiz not found." }
    }

    if (quizRow.isPaidQuiz) {
      const [paid] = await db
        .select({ id: quizPayment.id })
        .from(quizPayment)
        .where(
          and(
            eq(quizPayment.quizId, quizId),
            eq(quizPayment.userId, userId),
            eq(quizPayment.status, "paid")
          )
        )

      if (!paid) {
        return { success: false, error: "Payment required before taking this quiz." }
      }
    }

    const result = await createAttempt({ quizId, userId })
    if (result.status === "expired") {
      return { success: false, error: "Quiz is expired and can no longer be started." }
    }
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to create attempt:", error)
    return { success: false, error: "Could not create attempt, try again in 5 seconds" }
  }
}
