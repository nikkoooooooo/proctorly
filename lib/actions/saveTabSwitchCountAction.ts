"use server"

import { db } from "@/lib/db"
import { attempt } from "@/lib/schema"
import { eq, gt } from "drizzle-orm"

/**
 * Saves tab switching count on a specific attempt.
 * Will update only if new count is higher to prevent overwritten data.
 */
export async function saveTabSwitchCountAction(attemptId: string, count: number) {

  // Fetch current attempt data
  const [existing] = await db
    .select()
    .from(attempt)
    .where(eq(attempt.id, attemptId))
    .execute()

  if (!existing) {
    throw new Error("Attempt not found.")
  }

  // Prevent overwriting with smaller number (e.g. page refresh)
  const newCount = Math.max(existing.tabSwitchCount || 0, count)

  await db
    .update(attempt)
    .set({
      tabSwitchCount: newCount,
      updatedAt: new Date()
    })
    .where(eq(attempt.id, attemptId))
    .execute()

  return {
    updated: true,
    tabSwitchCount: newCount
  }
}
