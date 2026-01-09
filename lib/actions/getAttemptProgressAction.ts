"use server"

import { db } from "@/lib/db"
import { attempt, attemptAnswer } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function getAttemptProgressAction(attemptId: string) {
  const answers = await db
    .select()
    .from(attemptAnswer)
    .where(eq(attemptAnswer.attemptId, attemptId))
    .execute()

  return answers // array of { questionId, optionId, ... }
}
