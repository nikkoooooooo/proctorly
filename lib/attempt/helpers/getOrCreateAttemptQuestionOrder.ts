"use server"

import { db } from "@/lib/db"
import { attempt, attemptQuestionProgress, question } from "@/lib/schema"
import { eq, asc, and } from "drizzle-orm"
import { v4 as uuid } from "uuid"

// Shuffle array in-place (Fisher-Yates) for a stable per-attempt order
function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export async function getOrCreateAttemptQuestionOrder(attemptId: string) {
  // Find quizId for this attempt so we can load questions
  const [currentAttempt] = await db
    .select({ quizId: attempt.quizId })
    .from(attempt)
    .where(eq(attempt.id, attemptId))
    .execute()

  if (!currentAttempt) {
    throw new Error("Attempt not found")
  }

  // Load questions in original order (position)
  const questions = await db
    .select({
      id: question.id,
      timerLimit: question.timerLimit,
      position: question.position,
    })
    .from(question)
    .where(eq(question.quizId, currentAttempt.quizId))
    .orderBy(asc(question.position), asc(question.id))
    .execute()

  // Check if we already saved an order for this attempt
  const existing = await db
    .select({
      questionId: attemptQuestionProgress.questionId,
      orderIndex: attemptQuestionProgress.orderIndex,
      isAnswered: attemptQuestionProgress.isAnswered,
      remainingTime: attemptQuestionProgress.remainingTime,
    })
    .from(attemptQuestionProgress)
    .where(eq(attemptQuestionProgress.attemptId, attemptId))
    .execute()

  if (existing.length > 0) {
    const questionIds = new Set(questions.map((q) => q.id))
    const hasExpectedCount = existing.length === questions.length
    const onlyKnownQuestionIds = existing.every((row) => questionIds.has(row.questionId))
    const hasAllOrderIndexes = existing.every((row) => row.orderIndex != null)
    const orderIndexes = existing
      .filter((row) => row.orderIndex != null)
      .map((row) => row.orderIndex as number)
    const hasUniqueOrderIndexes = new Set(orderIndexes).size === existing.length

    // Valid existing progress: reuse exactly as saved
    if (hasExpectedCount && onlyKnownQuestionIds && hasAllOrderIndexes && hasUniqueOrderIndexes) {
      const ordered = existing
        .slice()
        .sort((a, b) => (a.orderIndex ?? 999999) - (b.orderIndex ?? 999999))
        .map((row) => row.questionId)
      return {
        order: ordered,
        answeredIds: existing.filter((row) => row.isAnswered).map((row) => row.questionId),
        remainingTimeById: Object.fromEntries(
          existing.map((row) => [row.questionId, row.remainingTime]),
        ),
      }
    }

    // Repair invalid/legacy progress rows by recreating stable shuffled order
    const shuffled = shuffle(questions.slice())
    const existingById = new Map(existing.map((row) => [row.questionId, row]))

    await Promise.all(
      shuffled.map(async (q, index) => {
        const prev = existingById.get(q.id)
        if (prev) {
          await db
            .update(attemptQuestionProgress)
            .set({
              orderIndex: index,
              remainingTime: prev.remainingTime ?? q.timerLimit ?? 30,
            })
            .where(
              and(
                eq(attemptQuestionProgress.attemptId, attemptId),
                eq(attemptQuestionProgress.questionId, q.id),
              ),
            )
          return
        }

        await db.insert(attemptQuestionProgress).values({
          id: uuid(),
          attemptId,
          questionId: q.id,
          remainingTime: q.timerLimit ?? 30,
          orderIndex: index,
          isAnswered: false,
        })
      }),
    )

    // Return saved order (fallback: push nulls to the end)
    const ordered = shuffled.map((row) => row.id)
    return {
      order: ordered,
      answeredIds: existing
        .filter((row) => row.isAnswered && questionIds.has(row.questionId))
        .map((row) => row.questionId),
      remainingTimeById: Object.fromEntries(
        shuffled.map((q) => {
          const prev = existingById.get(q.id)
          return [q.id, prev?.remainingTime ?? q.timerLimit ?? 30]
        }),
      ),
    }
  }

  // First-time progress creation: shuffle once for this attempt
  const shuffled = shuffle(questions.slice())

  // Create per-question progress rows with a stable order index
  await db.insert(attemptQuestionProgress).values(
    shuffled.map((q, index) => ({
      id: uuid(),
      attemptId,
      questionId: q.id,
      // Save the initial time for this question
      remainingTime: q.timerLimit ?? 30,
      // Save the stable order so resume is consistent
      orderIndex: index,
      isAnswered: false,
    }))
  )

  return {
    order: shuffled.map((q) => q.id),
    answeredIds: [],
    // Initialize remaining times from the question limits
    remainingTimeById: Object.fromEntries(
      shuffled.map((q) => [q.id, q.timerLimit ?? 30]),
    ),
  }
}
