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
  return answerAttemptHelper({
    attemptId,
    questionId,
    optionId,
    textAnswer,
    isCorrect,
  })
}
