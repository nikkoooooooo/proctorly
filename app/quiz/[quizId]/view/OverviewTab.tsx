import { getQuizForEditAction } from "@/lib/quiz/actions/getQuizForEditAction"
import Link from "next/link"

export default async function OverviewTab({ quizId }: { quizId: string }) {
  const result = await getQuizForEditAction(quizId)
  if (!result.success || !result.quiz) return <p>Quiz not found.</p>

  const quiz = result.quiz

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Quiz Overview
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {quiz.title}
            </h2>
            {quiz.description ? (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {quiz.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No description provided.
              </p>
            )}
          </div>
          <Link
            href={`/quiz/${quizId}/monitor`}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90 active:bg-primary/80"
          >
            Open Live Monitor
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-border/60 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Join Code
            </div>
            <div className="mt-2 text-xl font-semibold text-foreground">
              {quiz.joinCode}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border/60 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Passing Percentage
            </div>
            <div className="mt-2 text-xl font-semibold text-foreground">
              {quiz.passingPercentage != null ? `${quiz.passingPercentage}%` : "—"}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border/60 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Expiry
            </div>
            <div className="mt-2 text-xl font-semibold text-foreground">
              {quiz.expiresAt ? String(quiz.expiresAt) : "No expiry"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="card p-5 space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Sharing Tips
          </div>
          <div className="text-sm text-muted-foreground">
            Send the join code to students when you are ready to begin.
          </div>
          <div className="text-sm text-muted-foreground">
            Live monitor refreshes every 10 seconds.
          </div>
          <div className="text-sm text-muted-foreground">
            Warnings appear after repeated tab switches.
          </div>
        </div>
      </div>
    </div>
  )
}
