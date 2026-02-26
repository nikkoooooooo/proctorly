"use server"

import { db } from "@/lib/db"
import { attempt, option, question, quiz } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"

export async function getQuizForEditAction(quizId: string) {
  try {
    const [quizData] = await db
      .select()
      .from(quiz)
      .where(eq(quiz.id, quizId))
      .execute()

    if (!quizData) {
      return { success: false, error: "Quiz not found" }
    }

    const attemptExists = await db
      .select({ id: attempt.id })
      .from(attempt)
      .where(eq(attempt.quizId, quizId))
      .limit(1)
      .execute()

    const readOnly = attemptExists.length > 0

    const questions = await db
      .select()
      .from(question)
      .where(eq(question.quizId, quizId))
      .execute()

    const questionIds = questions.map((q) => q.id)
    const options = questionIds.length
      ? await db.select().from(option).where(inArray(option.questionId, questionIds)).execute()
      : []

    const optionsByQuestionId = new Map<string, typeof options>()
    for (const opt of options) {
      const list = optionsByQuestionId.get(opt.questionId) ?? []
      list.push(opt)
      optionsByQuestionId.set(opt.questionId, list)
    }

    const questionsWithOptions = questions.map((q) => ({
      ...q,
      options: optionsByQuestionId.get(q.id) ?? [],
    }))

    return { success: true, quiz: quizData, questions: questionsWithOptions, readOnly }
  } catch (error) {
    console.error("Failed to fetch quiz for edit:", error)
    return { success: false, error: "Failed to load quiz." }
  }
}
