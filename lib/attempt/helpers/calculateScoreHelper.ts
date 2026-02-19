"use server"

import { db } from "@/lib/db"
import { attempt, attemptAnswer, question } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function calculateScoreHelper(attemptId: string) {
  // 1) Load attempt to get quizId
  const [currentAttempt] = await db
    .select()
    .from(attempt)
    .where(eq(attempt.id, attemptId))
    .execute()

  if (!currentAttempt) {
    return { success: false, error: "Attempt not found." }
  }

  // 2) Load quiz questions (with points)
  const quizQuestions = await db
    .select()
    .from(question)
    .where(eq(question.quizId, currentAttempt.quizId))
    .execute()

  // 3) Load submitted answers
  const answers = await db
    .select()
    .from(attemptAnswer)
    .where(eq(attemptAnswer.attemptId, attemptId))
    .execute()

  // 4) Block completion if not all questions are answered
  if (answers.length < quizQuestions.length) {
    return {
      success: false,
      error: "Quiz is not fully answered yet.",
    }
  }

  // 5) Build a map of questionId -> points
  const pointsByQuestionId = new Map<string, number>()
  for (const q of quizQuestions) {
    pointsByQuestionId.set(q.id, q.points ?? 1)
  }

  // 6) Calculate earned points based on correctness
  const earnedPoints = answers.reduce((sum, ans) => {
    if (!ans.isCorrect) return sum
    return sum + (pointsByQuestionId.get(ans.questionId) ?? 1)
  }, 0)

  // 7) Total possible points for the quiz
  const totalPoints = quizQuestions.reduce((sum, q) => sum + (q.points ?? 1), 0)

  return {
    success: true,
    attempt: currentAttempt,
    answers,
    quizQuestions,
    earnedPoints,
    totalPoints,
    totalQuestions: quizQuestions.length,
    totalCorrect: answers.filter((a) => a.isCorrect).length,
  }
}
