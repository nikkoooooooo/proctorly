import { db } from "@/lib/db"
import { attemptAnswer, attemptQuestionProgress } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { v4 as uuid } from "uuid";          // generate unique IDs


interface AnswerAttemptProps {
  attemptId: string
  questionId: string
  optionId?: string   // optional for identification questions
  textAnswer?: string
  isCorrect?: boolean
  // Marks an auto-fail (time ran out without an answer)
  isAutoFail?: boolean
}

export async function answerAttemptHelper({
  attemptId,
  questionId,
  optionId,
  textAnswer,
  isCorrect,
  isAutoFail,
}: AnswerAttemptProps) {
  // Save the student's answer first
  const result = await db.insert(attemptAnswer).values({
    id: uuid(),
    attemptId,
    questionId,
    optionId: optionId || null,
    textAnswer: textAnswer || null,
    // Auto-fail sets correctness to false by definition
    isCorrect: isAutoFail ? false : isCorrect,
    answeredAt: new Date(),
  }).returning()

  // Build update payload so we only touch remainingTime on auto-fail
  const updateData: {
    isAnswered: boolean
    updatedAt: Date
    remainingTime?: number
  } = {
    isAnswered: true,
    updatedAt: new Date(),
  }

  if (isAutoFail) {
    // Auto-fail should lock the timer at zero
    updateData.remainingTime = 0
  }

  // Mark this question as answered so it won't show again on resume
  await db
    .update(attemptQuestionProgress)
    .set(updateData)
    .where(
      and(
        eq(attemptQuestionProgress.attemptId, attemptId),
        eq(attemptQuestionProgress.questionId, questionId),
      ),
    )

  return result[0]  // return the newly saved answer
}
