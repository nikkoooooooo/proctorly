"use server"

import { answerAttemptHelper } from "@/lib/attempt/helpers/answerAttemptHelper"

interface AnswerAttemptActionProps {
  attemptId: string
  questionId: string
  optionId?: string
  textAnswer?: string
  isCorrect?: boolean
  // Marks an auto-fail (time ran out without an answer)
  isAutoFail?: boolean
}

export async function answerAttemptAction({
  attemptId,
  questionId,
  optionId,
  textAnswer,
  isCorrect,
  isAutoFail,
}: AnswerAttemptActionProps) {
  try {
    const result = await answerAttemptHelper({
      attemptId,
      questionId,
      optionId,
      textAnswer,
      isCorrect,
      isAutoFail,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to answer attempt:", error)
    return { success: false, error: (error as Error).message }
  }
}
