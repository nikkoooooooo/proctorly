import { db } from "@/lib/db"
import { quiz } from "@/lib/schema"
import { eq } from "drizzle-orm"

/**
 * Fetch a quiz by its ID (only the quiz info, no questions/options)
 */
export async function getQuizByIdAction(quizId: string) {
  const [quizData] = await db
    .select()
    .from(quiz)
    .where(eq(quiz.id, quizId))
    .execute()

  if (!quizData) {
    throw new Error("Quiz not found")
  }

  return quizData
}
