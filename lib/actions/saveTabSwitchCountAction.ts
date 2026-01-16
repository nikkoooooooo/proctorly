"use server";

import { db } from "@/lib/db";
import { attempt } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function saveTabSwitchCountAction(attemptId: string, count: number) {
  try {
    // Fetch current attempt
    const [existing] = await db
      .select()
      .from(attempt)
      .where(eq(attempt.id, attemptId))
      .execute();

    if (!existing) {
      return { success: false, error: "Attempt not found" };
    }

    // Prevent overwriting with smaller number
    const newCount = Math.max(existing.tabSwitchCount || 0, count);

    await db
      .update(attempt)
      .set({ tabSwitchCount: newCount, updatedAt: new Date() })
      .where(eq(attempt.id, attemptId))
      .execute();

    return { success: true, updated: true, tabSwitchCount: newCount };
  } catch (error) {
    console.error("Failed to save tab switch count:", error);
    return {
      success: false,
      error: "Could not save tab switch count. Please try again in a few seconds.",
    };
  }
}
