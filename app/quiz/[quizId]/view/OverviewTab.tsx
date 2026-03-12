import { getQuizForEditAction } from "@/lib/quiz/actions/getQuizForEditAction"

export default async function OverviewTab({ quizId }: { quizId: string }) {
  const result = await getQuizForEditAction(quizId)
  if (!result.success || !result.quiz) return <p>Quiz not found.</p>

  const quiz = result.quiz

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="card p-5 space-y-3">
        <div className="text-sm text-muted-foreground">Quiz Overview</div>
        <h2 className="text-2xl font-semibold">{quiz.title}</h2>
        {quiz.description ? (
          <p className="text-muted-foreground">{quiz.description}</p>
        ) : (
          <p className="text-muted-foreground">No description provided.</p>
        )}
        <div>
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90 active:bg-primary/80"
          >
            Monitor
          </button>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Join Code</div>
          <div className="mt-1 inline-flex items-center rounded-[var(--radius-button)] border border-muted-foreground/30 px-3 py-2 font-semibold">
            {quiz.joinCode}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Expiry</div>
          <div className="mt-1 font-medium">
            {quiz.expiresAt ? String(quiz.expiresAt) : "No expiry"}
          </div>
        </div>
      </div>
    </div>
  )
}
