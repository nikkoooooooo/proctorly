"use server"

import { getOrCreateAttemptQuestionOrder } from "@/lib/helpers/getOrCreateAttemptQuestionOrder"

export async function getOrCreateAttemptQuestionOrderAction(attemptId: string) {
  try {
    const result = await getOrCreateAttemptQuestionOrder(attemptId)
    return {
      success: true,
      order: result.order,
      answeredIds: result.answeredIds,
      remainingTimeById: result.remainingTimeById,
    }
  } catch (error) {
    console.error("Failed to get or create question order:", error)
    return {
      success: false,
      error: "Could not prepare question order",
    }
  }
}
