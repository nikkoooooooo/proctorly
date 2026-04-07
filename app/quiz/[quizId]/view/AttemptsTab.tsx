"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import { getQuizAttemptsAction } from "@/lib/attempt/actions/getQuizAttemptsAction"
import { getQuizByIdAction } from "@/lib/quiz/actions/getQuizByIdAction"

interface Attempt {
  attemptId: string
  name: string | null
  email: string | null
  studentNo?: string | null
  section?: string | null
  score: number | null
  totalPoints?: number | null
  attemptCount?: number
  tabSwitchCount: number
  completed: boolean
  startedAt?: string | Date | null
  submittedAt?: string | Date | null
}

export default function AttemptsTab() {
  const params = useParams<{ quizId: string }>()
  const quizId = params?.quizId ?? ""

  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [quizTitle, setQuizTitle] = useState("Quiz")
  const [passingPercentage, setPassingPercentage] = useState<number | null>(null)

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

  useEffect(() => {
    if (!quizId) return
    const fetchAttempts = async () => {
      try {
        setLoading(true)
        const quizRes = await getQuizByIdAction(quizId)
        if (quizRes.success && quizRes.quiz?.title) {
          setQuizTitle(quizRes.quiz.title)
        }
        setPassingPercentage(quizRes.success ? quizRes.quiz?.passingPercentage ?? null : null)
        const data = await getQuizAttemptsAction(quizId)
        if (data) {
          const sortedAttempts = [...(data.attempts ?? [])].sort((a, b) => {
            const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0
            const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0
            return bTime - aTime
          })
          setAttempts(sortedAttempts)
        }
      } catch (err) {
        console.error("Failed to fetch attempts:", err)
        setAttempts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()
  }, [quizId])

  const exportToExcel = () => {
    if (!attempts || attempts.length === 0) return

    const generatedAt = formatPHDateTime(new Date())
    const headers = [
      "Name",
      "Email",
      "Student No",
      "Section",
      "Attempts",
      "Score",
      "Percentage",
      "Passed",
      "Tab Switches",
      "Status",
      "Started (PH)",
      "Finished (PH)",
    ]

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Proctorly Quiz Attempts Report"],
      [`Quiz Title: ${quizTitle}`],
      [`Generated (PH): ${generatedAt}`],
      [],
      headers,
    ])

    const dataRows = attempts.map((a) => {
      const total = a.totalPoints ?? 0
      const percentage = total > 0 ? ((a.score ?? 0) / total) * 100 : 0
      const passed =
        passingPercentage == null || a.score == null
          ? "—"
          : percentage >= passingPercentage
            ? "Passed"
            : "Failed"
      return [
        a.name ?? "Unknown",
        a.email ?? "Unknown",
        a.studentNo ?? "N/A",
        a.section ?? "N/A",
        a.attemptCount ?? 1,
        a.completed ? (a.score ?? 0) : null,
        a.completed ? `${percentage.toFixed(2)}%` : null,
        passed,
        a.tabSwitchCount,
        a.completed ? "Completed" : "Ongoing",
        formatPHDateTime(a.startedAt),
        formatPHDateTime(a.submittedAt),
      ]
    })

    XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: "A6" })

    worksheet["!cols"] = [
      { wch: 24 },
      { wch: 32 },
      { wch: 16 },
      { wch: 16 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 24 },
      { wch: 24 },
    ]
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    ]
    worksheet["!autofilter"] = { ref: "A5:L5" }
    worksheet["!freeze"] = { xSplit: 0, ySplit: 5 }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Results")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    saveAs(file, `quiz-results-${quizId}.xlsx`)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Student Attempts</h2>
          <p className="text-sm text-muted-foreground">Quiz: {quizTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/quiz/${quizId}/monitor`}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-(--radius-button) font-semibold hover:bg-primary/90 active:bg-primary/80"
          >
            Open Live Monitor
          </Link>
          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center justify-center bg-emerald-500/90 text-white px-4 py-2 rounded-(--radius-button) font-semibold hover:bg-emerald-500"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : attempts.length === 0 ? (
        <p className="text-muted-foreground">No students have attempted this quiz yet.</p>
      ) : (
        <div className="card p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border border-muted-foreground/30 rounded-(--radius-button) overflow-hidden">
              <thead>
                <tr className="text-left border-b border-muted-foreground/20">
                  <th className="py-2 px-3">Student</th>
                  <th className="py-2 px-3">Student No</th>
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Attempts</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Percentage</th>
                  <th className="py-2 px-3">Passed</th>
                  <th className="py-2 px-3">Tab Switches</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Started (PH)</th>
                  <th className="py-2 px-3">Finished (PH)</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.attemptId} className="border-b border-muted-foreground/10 last:border-b-0">
                    <td className="py-2 px-3 font-medium">{a.name ?? "Student"}</td>
                    <td className="py-2 px-3">{a.studentNo ?? "—"}</td>
                    <td className="py-2 px-3">{a.section ?? "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{a.email ?? "Unknown"}</td>
                    <td className="py-2 px-3 font-semibold">{a.attemptCount ?? 1}</td>
                    <td className="py-2 px-3 font-semibold">{a.score ?? 0}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {(() => {
                        const total = a.totalPoints ?? 0
                        const percentage = total > 0 ? ((a.score ?? 0) / total) * 100 : 0
                        return `${percentage.toFixed(2)}%`
                      })()}
                    </td>
                    <td className="py-2 px-3">
                      {passingPercentage == null || a.score == null ? (
                        "—"
                      ) : (
                        (() => {
                          const total = a.totalPoints ?? 0
                          const percentage = total > 0 ? (a.score / total) * 100 : 0
                          return percentage >= passingPercentage ? (
                            <span className="text-emerald-500 font-semibold">Passed</span>
                          ) : (
                            <span className="text-rose-500 font-semibold">Failed</span>
                          )
                        })()
                      )}
                    </td>
                    <td className="py-2 px-3 text-red-400 font-semibold">{a.tabSwitchCount}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-(--radius-button) font-semibold text-xs ${
                          a.completed
                            ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-200"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {a.completed ? "Completed" : "Ongoing"}
                      </span>
                    </td>
                    <td className="py-2 px-3">{formatPHDateTime(a.startedAt)}</td>
                    <td className="py-2 px-3">{formatPHDateTime(a.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
