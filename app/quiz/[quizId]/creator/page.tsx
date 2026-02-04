// //TODO::::::::::::::::: IMPLEMENT THE EXPORT FEATURE IN TO THE EXCELL
// //TODO::::::::::::::::: THEN SOLVES THE PROBLEM IN ONLY MAKE IT NULL WHEN THE TIME IS LEFT, AND
// //TODO REMOVE THE QUESTION THAT IS ALREADY ANSWERED


"use client" // ✅ Required: Excel export uses browser APIs (Blob, FileSaver)

import { useState, useEffect } from "react"
import * as XLSX from "xlsx" // ✅ SheetJS for creating Excel
import { saveAs } from "file-saver" // ✅ Save Blob as file in browser

import { getQuizAttemptsAction } from "@/lib/actions/getQuizAttemptsAction"
import { quiz } from "@/lib/schema"

interface Attempt {
  attemptId: string
  name: string | null
  email: string | null
  score: number | null
  tabSwitchCount: number
  completed: boolean
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
  const [quizIdParams, setQuizIdParams] = useState("")



  useEffect(() => {
    const fetchParams = async () => {
      try {
          const { quizId } = await params
          setQuizIdParams(quizId)
      } catch (error) {
        console.error(error)
      }
    }
    fetchParams()
  }, [params])

  // 2️⃣ Fetch attempts on mount
  useEffect(() => {
    const fetchAttempts = async () => {
      try { 
        const data = await getQuizAttemptsAction(quizIdParams)
        if (data) {
          setAttempts(data.attempts ?? [])
        }
      } catch (err) {
        console.error("Failed to fetch attempts:", err)
        setAttempts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()
  }, [quizIdParams])

  // =====================
  // 3️⃣ Export to Excel
  // =====================
  const exportToExcel = () => {
    if (!attempts || attempts.length === 0) return

    // Map attempts into rows for Excel
    const rows = attempts.map((a) => ({
      Name: a.name ?? "unknown",
      Email: a.email ?? "unknown",
      Score: a.completed ? a.score : null, // ✅ null if not completed
      "Tab Switches": a.tabSwitchCount,
      Status: a.completed ? "Completed" : "Ongoing",
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows)

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
    saveAs(file, `quiz-results-${quizIdParams}.xlsx`)
  }

  // =====================
  // 4️⃣ Render
  // =====================
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-foreground ">Students Attempts</h1>
      {/* Use muted-foreground for readability in both themes */}
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

          {/* List of attempts */}
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="flex flex-col gap-4 w-full">
              {attempts.map((a) => (
                <div
                  key={a.attemptId}
                  className="card p-4 flex flex-col md:flex-row justify-between items-start md:items-center w-full"
                >
                  {/* Left: Name & Email */}
                  <div className="mb-2 md:mb-0">
                    <h3 className="text-lg font-semibold text-foreground wrap-break-word">{a.name}</h3>
                    <p className="text-muted-foreground text-sm wrap-break-word">{a.email}</p>
                  </div>

                  {/* Right: Score, Tab switches, Completed */}
                  <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
                    <p className="text-foreground font-semibold text-sm">Score: {a.score ?? 0}</p>
                    <p className="text-red-500 font-semibold text-sm">
                      Tab switches: {a.tabSwitchCount}
                    </p>
                    <p
                      className={`px-2 py-1 rounded-[var(--radius-button)] font-semibold text-sm mt-1 sm:mt-0 ${
                        a.completed ? "bg-green-600 text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {a.completed ? "Completed" : "Ongoing"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
