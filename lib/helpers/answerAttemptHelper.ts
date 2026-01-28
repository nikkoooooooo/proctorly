import { db } from "@/lib/db"
import { attemptAnswer } from "@/lib/schema"
import { v4 as uuid } from "uuid";          // generate unique IDs


interface AnswerAttemptProps {
  attemptId: string
  questionId: string
  optionId?: string   // optional for identification questions
  textAnswer?: string
  isCorrect?: boolean
}

export async function answerAttemptHelper({
  attemptId,
  questionId,
  optionId,
  textAnswer,
  isCorrect,
}: AnswerAttemptProps) {
  const result = await db.insert(attemptAnswer).values({
    id: uuid(),
    attemptId,
    questionId,
    optionId: optionId || null,
    textAnswer: textAnswer || null,
    isCorrect,
    answeredAt: new Date(),
  }).returning()

  return result[0]  // return the newly saved answer
}
