// //TODO::::::::::::::::: IMPLEMENT THE EXPORT FEATURE IN TO THE EXCELL
// //TODO::::::::::::::::: THEN SOLVES THE PROBLEM IN ONLY MAKE IT NULL WHEN THE TIME IS LEFT, AND
// //TODO REMOVE THE QUESTION THAT IS ALREADY ANSWERED


"use client" // ✅ Required: Excel export uses browser APIs (Blob, FileSaver)

import { useState, useEffect } from "react"
import Link from "next/link"
import * as XLSX from "xlsx" // ✅ SheetJS for creating Excel
import { saveAs } from "file-saver" // ✅ Save Blob as file in browser

import { getQuizAttemptsAction } from "@/lib/attempt/actions/getQuizAttemptsAction"
import { getQuizByIdAction } from "@/lib/quiz/actions/getQuizByIdAction"

interface Attempt {
  attemptId: string
  name: string | null
  email: string | null
  studentNo?: string | null
  section?: string | null
  score: number | null
  tabSwitchCount: number
  completed: boolean
  startedAt?: string | Date | null
  submittedAt?: string | Date | null
}

interface TeacherPageProps {
  params: { quizId: string }
}

// =====================
// Main TeacherPage
// =====================
export default function TeacherPage({ params }: TeacherPageProps) {

  // 1️⃣ Store attempts in state
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [quizTitle, setQuizTitle] = useState("Quiz")
  const { quizId } = params

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

  // 2️⃣ Fetch attempts on mount
  useEffect(() => {
    if (!quizId) return
    const fetchAttempts = async () => {
      try { 
        setLoading(true)
        const quizRes = await getQuizByIdAction(quizId)
        if (quizRes.success && quizRes.quiz?.title) {
          setQuizTitle(quizRes.quiz.title)
        }
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

  // =====================
  // 3️⃣ Export to Excel
  // =====================
  const exportToExcel = () => {
    if (!attempts || attempts.length === 0) return

    const generatedAt = formatPHDateTime(new Date())
    const headers = [
      "Name",
      "Email",
      "Student No",
      "Section",
      "Score",
      "Tab Switches",
      "Status",
      "Started (PH)",
      "Finished (PH)",
    ]

    // Build a structured sheet layout for cleaner export
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Proctorly Quiz Attempts Report"],
      [`Quiz Title: ${quizTitle}`],
      [`Generated (PH): ${generatedAt}`],
      [],
      headers,
    ])

    const dataRows = attempts.map((a) => [
      a.name ?? "Unknown",
      a.email ?? "Unknown",
      a.studentNo ?? "N/A",
      a.section ?? "N/A",
      a.completed ? (a.score ?? 0) : null,
      a.tabSwitchCount,
      a.completed ? "Completed" : "Ongoing",
      formatPHDateTime(a.startedAt),
      formatPHDateTime(a.submittedAt),
    ])

    XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: "A6" })

    // Sheet formatting
    worksheet["!cols"] = [
      { wch: 24 }, // Name
      { wch: 32 }, // Email
      { wch: 16 }, // Student No
      { wch: 16 }, // Section
      { wch: 10 }, // Score
      { wch: 14 }, // Tab Switches
      { wch: 14 }, // Status
      { wch: 24 }, // Started
      { wch: 24 }, // Finished
    ]
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
    ]
    worksheet["!autofilter"] = { ref: "A5:I5" }
    worksheet["!freeze"] = { xSplit: 0, ySplit: 5 }

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Results")

    // Write workbook to binary array
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convert to Blob
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Save file
    saveAs(file, `quiz-results-${quizId}.xlsx`)
  }

  // =====================
  // 4️⃣ Render
  // =====================
  return (
    <div className="p-2 w-full flex flex-col">
      {/* <Link href={"/created-quiz"} className="text-4xl font-bold">←</Link> */}
      <h1 className="text-3xl font-bold text-foreground">Students Attempts</h1>
      <p className="text-muted-foreground mb-6">Detailed breakdown of participant performance and proctoring logs</p>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : attempts.length === 0 ? (
        <p className="text-muted-foreground">No students have attempted this quiz yet.</p>
      ) : (
        <>
          {/* Export button */}
          <button
            onClick={exportToExcel}
            className="mb-4 px-4 py-2 bg-green-600 text-primary-foreground rounded-[var(--radius-button)] hover:bg-green-500 
            focus:bg-green-300 font-semibold"
          >
            Export to Excel
          </button>

          {/* Attempts table */}
          <div className="card p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border border-muted-foreground/30 rounded-[var(--radius-button)] overflow-hidden">
                <thead>
                  <tr className="text-left border-b border-muted-foreground/20">
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Student No</th>
                    <th className="py-2 px-3">Section</th>
                    <th className="py-2 px-3">Score</th>
                    <th className="py-2 px-3">Tab Switches</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Started (PH)</th>
                    <th className="py-2 px-3">Finished (PH)</th>
                    <th className="py-2 px-3">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.attemptId} className="border-b border-muted-foreground/10 last:border-b-0">
                      <td className="py-2 px-3 font-medium">{a.name ?? "Unknown"}</td>
                      <td className="py-2 px-3">{a.studentNo ?? "N/A"}</td>
                      <td className="py-2 px-3">{a.section ?? "N/A"}</td>
                      <td className="py-2 px-3">{a.score ?? 0}</td>
                      <td className="py-2 px-3 text-red-500 font-semibold">{a.tabSwitchCount}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded-[var(--radius-button)] font-semibold text-xs ${
                            a.completed
                              ? "bg-green-600 text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {a.completed ? "Completed" : "Ongoing"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{formatPHDateTime(a.startedAt)}</td>
                      <td className="py-2 px-3 text-muted-foreground">{formatPHDateTime(a.submittedAt)}</td>
                      <td className="py-2 px-3 text-muted-foreground">{a.email ?? "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
