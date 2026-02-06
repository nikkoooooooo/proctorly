/* One-time backfill: set question.position for existing quizzes */
"use server"
import { db } from "@/lib/db"
import { quiz, question } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

async function backfillQuestionPositions() {
  // Load all quizzes so we can backfill per quiz
  const quizzes = await db.select({ id: quiz.id }).from(quiz)

  for (const qz of quizzes) {
    // Fetch questions in a stable order (by id) for this quiz
    const questions = await db
      .select({ id: question.id, position: question.position })
      .from(question)
      .where(eq(question.quizId, qz.id))
      .orderBy(asc(question.id))

    let position = 1 // 1-based order for readability in teacher views
    for (const q of questions) {
      // Only fill missing positions to avoid overwriting new data
      if (q.position == null) {
        await db
          .update(question)
          .set({ position })
          .where(eq(question.id, q.id))
      }
      position += 1
    }
  }
}

backfillQuestionPositions()
  .then(() => {
    console.log("Backfill complete")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Backfill failed:", err)
    process.exit(1)
  })
