"use server"

import { db } from "@/lib/db"
import { attempt } from "@/lib/schema"
import { eq, and } from "drizzle-orm/expressions"

/**
 * Check if the user already has an attempt for this quiz
 */
export async function checkAttemptAction({
  quizId,
  userId,
}: {
  quizId: string
  userId: string
}) {
  // 1️⃣ Fetch the existing attempt for this user & quiz
  const [existing] = await db
    .select()
    .from(attempt)
    .where(and(eq(attempt.quizId, quizId), eq(attempt.userId, userId)))
    .execute()

  // 2️⃣ If no attempt exists, return false
  if (!existing) return { exists: false }

  // 3️⃣ If attempt exists and isCompleted is true
  if (existing.isCompleted) {
    return { exists: true, attempt: existing }
  }

  // 4️⃣ If attempt exists but not completed yet
  return { exists: true, attempt: existing }
}
