"use server"

import { db } from "@/lib/db"
import { attemptQuestionProgress } from "@/lib/schema"
import { and, eq } from "drizzle-orm"

interface UpdateAttemptQuestionTimeProps {
  attemptId: string
  questionId: string
  remainingTime: number
}

export async function updateAttemptQuestionTime({
  attemptId,
  questionId,
  remainingTime,
}: UpdateAttemptQuestionTimeProps) {
  // Save the remaining time so the timer can resume later
  await db
    .update(attemptQuestionProgress)
    .set({ remainingTime, updatedAt: new Date() })
    .where(
      and(
        eq(attemptQuestionProgress.attemptId, attemptId),
        eq(attemptQuestionProgress.questionId, questionId),
      ),
    )
}
