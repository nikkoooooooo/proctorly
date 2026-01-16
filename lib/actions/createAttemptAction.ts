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
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to create attempt:", error)
    return { success: false, error: "Could not create attempt, try again in 5 seconds" }
  }
}
