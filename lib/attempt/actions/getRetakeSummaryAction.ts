"use server"

import { getRetakeSummaries } from "@/lib/attempt/helpers/getRetakeSummary"

export async function getRetakeSummaryAction({
  userId,
  quizId,
}: {
  userId: string
  quizId: string
}) {
  const summaries = await getRetakeSummaries({ userId, quizIds: [quizId] })
  return summaries[quizId] ?? {
    attemptCount: 0,
    latestAttemptId: null,
    latestAttemptCompleted: false,
  }
}
