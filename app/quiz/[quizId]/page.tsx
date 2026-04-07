// app/quiz/[quizId]/page.tsx
import { redirect } from "next/navigation"
import QuizMainPageClient from "./QuizMainPageClient"
import { getSession } from "@/lib/auth-actions"
import AlreadyTakenPage from "./AlreadyTakenPage"
import { db } from "@/lib/db"
import { quiz } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getRetakeSummaries } from "@/lib/attempt/helpers/getRetakeSummary"

interface PageProps {
  params: { quizId: string }
}

export default async function Page({ params }: PageProps) {
  const { quizId } = await params // remove await

  // 1️⃣ Get session
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const [quizRow] = await db
    .select({ retakeLimit: quiz.retakeLimit })
    .from(quiz)
    .where(eq(quiz.id, quizId))

  if (!quizRow) {
    redirect("/dashboard")
  }

  const summaries = await getRetakeSummaries({
    userId: session.userId,
    quizIds: [quizId],
  })
  const summary = summaries[quizId]
  const attemptCount = summary?.attemptCount ?? 0
  const latestAttemptId = summary?.latestAttemptId ?? null
  const latestAttemptCompleted = summary?.latestAttemptCompleted ?? false
  const maxAttempts = 1 + (quizRow.retakeLimit ?? 0)

  if (attemptCount >= maxAttempts && latestAttemptCompleted && latestAttemptId) {
    return <AlreadyTakenPage quizId={quizId} attemptId={latestAttemptId} />
  }

  // 3️⃣ Render quiz client
  const hasActiveAttempt = attemptCount > 0 && !latestAttemptCompleted
  return <QuizMainPageClient quizId={quizId} hasActiveAttempt={hasActiveAttempt} />
}
