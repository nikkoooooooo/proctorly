import { db } from "@/lib/db"
import { question, option } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { presignRead } from "@/lib/storage/presign"

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
}

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
      caseSensitive: question.caseSensitive,
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

      const typedQuestion = {
        ...q,
        type: (q.type as "mcq" | "true-false" | "identification") ?? "mcq",
        caseSensitive: q.caseSensitive ?? false,
      }

      return {
        ...typedQuestion,
        imageUrl:
          q.imageUrl && !isHttpUrl(q.imageUrl) ? await presignRead(q.imageUrl) : q.imageUrl,
        option: options.map((o) => ({
          ...o,
          isCorrect: !!o.isCorrect, // convert null → false
        })),
      }
    })
  )

  return questionsWithOptions
}
