
"use server";

import { db } from "@/lib/db";
import { attemptAnswer } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getAttemptProgressAction(attemptId: string) {
  try {
    const answers = await db
      .select()
      .from(attemptAnswer)
      .where(eq(attemptAnswer.attemptId, attemptId))
      .execute();

    return { success: true, answers }; // always structured
  } catch (error) {
    console.error("Failed to get attempt progress:", error);
    return {
      success: false,
      error: "Could not load attempt progress. Please try again in a few seconds.",
    };
  }
}
