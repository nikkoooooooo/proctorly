"use server"
import { createAttempt } from "../helpers/createAttempt"

export async function createAttemptAction({
  quizId,
  userId,
}: {
  quizId: string
  userId: string
}) {
  try {
    const result = await createAttempt({ quizId, userId })
    if (result.status === "expired") {
      return { success: false, error: "Quiz is expired and can no longer be started." }
    }
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to create attempt:", error)
    return { success: false, error: "Could not create attempt, try again in 5 seconds" }
  }
}
