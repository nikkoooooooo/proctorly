"use server"

import { db } from "@/lib/db"
import { attempt, option, question, quiz } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"
import { v4 as uuid } from "uuid"

type QuestionType = "mcq" | "true-false"

interface UpdateQuizPayload {
  title: string
  description: string
  blurQuestion: boolean
  questions: Array<{
    id: string
    text: string
    type: QuestionType
    timerLimit?: number
    points?: number
    imageUrl?: string | null
    correctAnswer?: "true" | "false"
    options: Array<{ id: string; text: string; isCorrect: boolean }>
  }>
}

export async function updateQuizAction(quizId: string, payload: UpdateQuizPayload) {
  try {
    const attempts = await db
      .select({ id: attempt.id })
      .from(attempt)
      .where(eq(attempt.quizId, quizId))
      .limit(1)
      .execute()

    if (attempts.length > 0) {
      return { success: false, error: "Quiz already has attempts and cannot be edited." }
    }

    await db
      .update(quiz)
      .set({
        title: payload.title,
        description: payload.description,
        blurQuestion: payload.blurQuestion,
      })
      .where(eq(quiz.id, quizId))

    const existingQuestions = await db
      .select({ id: question.id })
      .from(question)
      .where(eq(question.quizId, quizId))
      .execute()

    const existingIds = existingQuestions.map((q) => q.id)
    const incomingIds = payload.questions.map((q) => q.id)

    const deletedIds = existingIds.filter((id) => !incomingIds.includes(id))
    if (deletedIds.length) {
      await db.delete(option).where(inArray(option.questionId, deletedIds))
      await db.delete(question).where(inArray(question.id, deletedIds))
    }

    for (const q of payload.questions) {
      const questionPayload = {
        text: q.text,
        type: q.type,
        timerLimit: q.timerLimit ?? 30,
        points: q.points ?? 1,
        imageUrl: q.imageUrl ?? null,
      }

      if (existingIds.includes(q.id)) {
        await db.update(question).set(questionPayload).where(eq(question.id, q.id))
      } else {
        await db.insert(question).values({
          id: q.id,
          quizId,
          ...questionPayload,
        })
      }

      if (q.type === "mcq") {
        const existingOpts = await db
          .select({ id: option.id })
          .from(option)
          .where(eq(option.questionId, q.id))
          .execute()

        const existingOptIds = existingOpts.map((o) => o.id)
        const incomingOptIds = q.options.map((o) => o.id)

        const deletedOptIds = existingOptIds.filter((id) => !incomingOptIds.includes(id))
        if (deletedOptIds.length) {
          await db.delete(option).where(inArray(option.id, deletedOptIds))
        }

        for (const opt of q.options) {
          if (existingOptIds.includes(opt.id)) {
            await db.update(option).set({ text: opt.text, isCorrect: opt.isCorrect }).where(eq(option.id, opt.id))
          } else {
            await db.insert(option).values({
              id: opt.id,
              questionId: q.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })
          }
        }
      } else {
        await db.delete(option).where(eq(option.questionId, q.id))

        const correct = q.correctAnswer ?? "true"
        await db.insert(option).values([
          {
            id: uuid(),
            questionId: q.id,
            text: "True",
            isCorrect: correct === "true",
          },
          {
            id: uuid(),
            questionId: q.id,
            text: "False",
            isCorrect: correct === "false",
          },
        ])
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to update quiz:", error)
    return { success: false, error: "Failed to update quiz." }
  }
}
