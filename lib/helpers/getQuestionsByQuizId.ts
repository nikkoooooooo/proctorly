import { db } from "@/lib/db"
import { question, option } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function getQuestionsByQuizId(quizId: string) {
  // get all questions
  const questions = await db
    .select()
    .from(question)
    .where(eq(question.quizId, quizId))
    .execute()

  // attach options to each question
  const questionsWithOptions = await Promise.all(
    questions.map(async (q) => {
      const options = await db
        .select()
        .from(option)
        .where(eq(option.questionId, q.id))
        .execute()

      // ensure isCorrect is boolean
      const safeOptions = options.map((o) => ({
        ...o,
        isCorrect: o.isCorrect ?? false,
      }))

      return { ...q, option: safeOptions } // now it matches your Questions interface
    })
  )

  return questionsWithOptions
}
