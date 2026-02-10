"use server"

import { db } from "@/lib/db"
import { attempt } from "@/lib/schema"
import { eq, and } from "drizzle-orm/expressions"

export async function checkAttemptAction({
  quizId,
  userId,
}: {
  quizId: string
  userId: string
}) {
  try {
    const [existing] = await db
      .select()
      .from(attempt)
      .where(and(eq(attempt.quizId, quizId), eq(attempt.userId, userId)))
      .execute()

    if (!existing) return { success: true, exists: false }

    return { success: true, exists: true, attempt: existing }
  } catch (error) {
    console.error("Failed to check attempt:", error)
    return { success: false, error: "Could not check attempt, try again later" }
  }
}
