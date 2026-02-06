"use server"

import { updateAttemptQuestionTime } from "@/lib/helpers/updateAttemptQuestionTime"

interface UpdateAttemptQuestionTimeActionProps {
  attemptId: string
  questionId: string
  remainingTime: number
}

export async function updateAttemptQuestionTimeAction({
  attemptId,
  questionId,
  remainingTime,
}: UpdateAttemptQuestionTimeActionProps) {
  try {
    await updateAttemptQuestionTime({ attemptId, questionId, remainingTime })
    return { success: true }
  } catch (error) {
    console.error("Failed to update remaining time:", error)
    return { success: false, error: "Could not update remaining time" }
  }
}
