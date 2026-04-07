"use server"

import { db } from "@/lib/db"
import { attempt, quiz, quizPayment } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { createAttempt } from "../helpers/createAttempt"
import { getRetakeSummaries } from "@/lib/attempt/helpers/getRetakeSummary"

export async function createAttemptAction({
  quizId,
  userId,
}: {
  quizId: string
  userId: string
}) {
  try {
    const [quizRow] = await db
      .select({ creatorId: quiz.creatorId, isPaidQuiz: quiz.isPaidQuiz, retakeLimit: quiz.retakeLimit })
      .from(quiz)
      .where(eq(quiz.id, quizId))

    if (!quizRow) {
      return { success: false, error: "Quiz not found." }
    }

    const summaries = await getRetakeSummaries({ userId, quizIds: [quizId] })
    const summary = summaries[quizId]
    const attemptCount = summary?.attemptCount ?? 0
    const latestAttemptId = summary?.latestAttemptId ?? null
    const latestAttemptCompleted = summary?.latestAttemptCompleted ?? false

    if (latestAttemptId && !latestAttemptCompleted) {
      const [activeAttempt] = await db
        .select({
          id: attempt.id,
          quizId: attempt.quizId,
          userId: attempt.userId,
          score: attempt.score,
          isCompleted: attempt.isCompleted,
          tabSwitchCount: attempt.tabSwitchCount,
          startedAt: attempt.startedAt,
          updatedAt: attempt.updatedAt,
          lastSeenAt: attempt.lastSeenAt,
          lastActivityAt: attempt.lastActivityAt,
          submittedAt: attempt.submittedAt,
        })
        .from(attempt)
        .where(eq(attempt.id, latestAttemptId))
      if (activeAttempt) {
        return { success: true, data: { status: "exists", attempt: activeAttempt } }
      }
    }

    const maxAttempts = 1 + (quizRow.retakeLimit ?? 0)
    if (attemptCount >= maxAttempts) {
      return { success: false, error: "Retake limit reached." }
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
