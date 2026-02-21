import { db } from "@/lib/db"
import { question, option } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function getQuestionsByQuizId(quizId: string) {
  // 1. Fetch questions properly including timerLimit
  const questions = await db
    .select({
      id: question.id,
      text: question.text,
      quizId: question.quizId,
      type: question.type,
      imageUrl: question.imageUrl,
      timeLimit: question.timerLimit,  // <-- FIXED (correct field)
    })
    .from(question)
    .where(eq(question.quizId, quizId))
    .execute()

  // 2. Attach options
  const questionsWithOptions = await Promise.all(
    questions.map(async (q) => {
      const options = await db
        .select({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })
        .from(option)
        .where(eq(option.questionId, q.id))
        .execute()

      return {
        ...q,
        option: options.map((o) => ({
          ...o,
          isCorrect: !!o.isCorrect, // convert null → false
        })),
      }
    })
  )

  return questionsWithOptions
}
