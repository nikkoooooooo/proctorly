"use server"

import { answerAttemptHelper } from "@/lib/helpers/answerAttemptHelper"

interface AnswerAttemptActionProps {
  attemptId: string
  questionId: string
  optionId?: string
  textAnswer?: string
  isCorrect: boolean
}

export async function answerAttemptAction({
  attemptId,
  questionId,
  optionId,
  textAnswer,
  isCorrect,
}: AnswerAttemptActionProps) {
  try {
    const result = await answerAttemptHelper({
      attemptId,
      questionId,
      optionId,
      textAnswer,
      isCorrect,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to answer attempt:", error)
    return { success: false, error: (error as Error).message }
  }
}
