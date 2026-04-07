import { db } from "@/lib/db"
import { attempt } from "@/lib/schema"
import { and, desc, eq, inArray } from "drizzle-orm"

export interface RetakeSummary {
  attemptCount: number
  latestAttemptId: string | null
  latestAttemptCompleted: boolean
}

export async function getRetakeSummaries({
  userId,
  quizIds,
}: {
  userId: string
  quizIds: string[]
}): Promise<Record<string, RetakeSummary>> {
  if (!quizIds.length) return {}

  const rows = await db
    .select({
      quizId: attempt.quizId,
      attemptId: attempt.id,
      isCompleted: attempt.isCompleted,
      startedAt: attempt.startedAt,
    })
    .from(attempt)
    .where(and(inArray(attempt.quizId, quizIds), eq(attempt.userId, userId)))
    .orderBy(desc(attempt.startedAt))

  const summary = new Map<string, RetakeSummary>()
  for (const row of rows) {
    const existing = summary.get(row.quizId)
    if (!existing) {
      summary.set(row.quizId, {
        attemptCount: 1,
        latestAttemptId: row.attemptId,
        latestAttemptCompleted: row.isCompleted,
      })
    } else {
      summary.set(row.quizId, {
        ...existing,
        attemptCount: existing.attemptCount + 1,
      })
    }
  }

  return Object.fromEntries(summary.entries())
}
