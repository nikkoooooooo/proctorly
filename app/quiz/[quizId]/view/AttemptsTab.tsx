import Link from "next/link"
import { getQuizAttemptsAction } from "@/lib/attempt/actions/getQuizAttemptsAction"
import { getQuizByIdAction } from "@/lib/quiz/actions/getQuizByIdAction"

export default async function AttemptsTab({ quizId }: { quizId: string }) {
  const quizRes = await getQuizByIdAction(quizId)
  const quizTitle = quizRes.success && quizRes.quiz?.title ? quizRes.quiz.title : "Quiz"

  const data = await getQuizAttemptsAction(quizId)
  const attempts = data?.attempts ?? []

  const formatPHDateTime = (value?: string | Date | null) => {
    if (!value) return "N/A"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "N/A"
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Student Attempts</h2>
          <p className="text-sm text-muted-foreground">
            Quiz: {quizTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/quiz/${quizId}/monitor`}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90 active:bg-primary/80"
          >
            Open Live Monitor
          </Link>
          <Link
            href={`/quiz/${quizId}/creator`}
            className="inline-flex items-center justify-center bg-secondary text-secondary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-secondary/80"
          >
            Open Attempts Page
          </Link>
        </div>
      </div>

      {attempts.length === 0 ? (
        <p className="text-muted-foreground">No students have attempted this quiz yet.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <div
              key={a.attemptId}
              className="card p-4 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">{a.name ?? "Student"}</h3>
                <p className="text-muted-foreground text-sm">{a.email ?? "Unknown"}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Started (PH): {formatPHDateTime(a.startedAt)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Finished (PH): {formatPHDateTime(a.submittedAt)}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <span className="text-foreground text-sm font-semibold">Score: {a.score ?? 0}</span>
                <span className="text-red-400 text-sm font-semibold">
                  Tab switches: {a.tabSwitchCount}
                </span>
                <span
                  className={`px-2 py-1 rounded-[var(--radius-button)] text-sm font-semibold ${
                    a.completed ? "bg-emerald-500/80 text-white" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {a.completed ? "Completed" : "Ongoing"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
