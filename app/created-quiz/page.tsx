"use client"
import { authClient } from "@/client/auth-client"
import { getUserQuizAction } from "@/lib/user/actions/getUserQuizAction"
import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { deleteQuizAction } from "@/lib/quiz/actions/deleteQuizAction"
import { copyQuizAction } from "@/lib/quiz/actions/copyQuizAction"
import { quiz } from "@/lib/schema"


interface Quiz {
  id: string
  title: string
  joinCode: string
  description?: string | null
  createdAt?: string | Date | null
  expiresAt?: string | Date | null
  attemptCount?: number
}

function formatPHDateTime(value?: string | Date | null) {
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

function Page() {

    const { data } = authClient.useSession()
    const user = data?.user

    const [userCreatedQuiz, setUserCreatedQuiz] = useState<Quiz[]>([])
    const [copyTarget, setCopyTarget] = useState<Quiz | null>(null)
    const [isCopying, setIsCopying] = useState(false)


    
    


    useEffect(() => {
        if (!user?.id) return
        const fetchQuiz = async () => {
            try {
                const createdQuizzes = await getUserQuizAction(user?.id)
                if (!createdQuizzes.quizzes) return
                const sortedQuizzes = [...createdQuizzes.quizzes].sort((a, b) => {
                  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
                  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
                  return bTime - aTime
                })
                console.log()
                setUserCreatedQuiz(sortedQuizzes)
            } catch (error) {
                console.error(error)
            }
        }
        fetchQuiz()
    },[data])

     const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this assessment?")) return
        try {
          await deleteQuizAction(quizId)
          setUserCreatedQuiz(prev => prev.filter(q => q.id !== quizId))
          toast.success("Assessment deleted!", {
            icon: "🗑️",
            style: { background: "#ffffff", color: "#2563eb", fontWeight: "bold" },
            duration: 4000,
          });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : String(err), {
            icon: "⚠️",
            style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
            duration: 5000,
          });
        }
      }
    
    const handleCopyQuiz = async () => {
      if (!copyTarget || !user?.id || isCopying) return
      try {
        setIsCopying(true)
        const result = await copyQuizAction(copyTarget.id, user.id)
        if (!result.success || !result.quiz) {
          toast.error(result.error || "Failed to copy assessment", {
            icon: "⚠️",
            style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
            duration: 5000,
          })
          return
        }

        setUserCreatedQuiz((prev) => [result.quiz as Quiz, ...prev])
        setCopyTarget(null)
        toast.success(`Assessment copied! New code: ${result.joinCode}`, {
          icon: "✅",
          style: { background: "#ffffff", color: "#2563eb", fontWeight: "bold" },
          duration: 5000,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err), {
          icon: "⚠️",
          style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
          duration: 5000,
        })
      } finally {
        setIsCopying(false)
      }
    }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5">
                <Link href={"/dashboard"} className="text-4xl font-bold">←</Link>
            </div>
            {/* Created assessments */}
        <div className="w-full mb-10">
            <div className="my-5 flex gap-2 items-center">
                <h2 className="text-2xl font-semibold text-foreground">Created Assessments</h2>
                <span className="bg-secondary text-secondary-foreground p-2 font-semibold rounded-(--radius-button)">Creator</span>
            </div>
            {userCreatedQuiz.length > 0 ? (
                userCreatedQuiz.map((quiz, i) => (
                <div className="card w-full h-auto p-5 mb-4" key={i}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex flex-col gap-2 items-start w-full sm:max-w-[18rem]">
                            <h3 className="text-foreground text-lg font-semibold">{quiz.title}</h3>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Assessment Code</span>
                              <span className="bg-primary/20 text-primary px-2 py-1 text-sm font-semibold rounded-(--radius-button) w-fit">
                                {quiz.joinCode}
                              </span>
                            </div>
                            {quiz.description && <p className="text-muted-foreground mt-2">{quiz.description}</p>}
                            <p className="text-muted-foreground mt-3 text-sm">
                              Created (PH): {formatPHDateTime(quiz.createdAt)} · Expires:{" "}
                              {quiz.expiresAt ? formatPHDateTime(quiz.expiresAt) : "No expiry"}
                            </p>
                        </div>

                        {/* Uniform button */}
                         <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">

                          <button
                            type="button"
                            onClick={() => setCopyTarget(quiz)}
                            className="bg-primary p-2 rounded-(--radius-button) font-semibold cursor-pointer text-primary-foreground hover:bg-primary/80 w-full sm:w-auto"
                          >
                                Duplicate
                          </button>
                            
                            <Link href={`/quiz/${quiz.id}/view?tab=overview`} className="bg-primary p-2 rounded-(--radius-button) font-semibold cursor-pointer text-primary-foreground hover:bg-primary/80 w-full sm:w-auto text-center">
                                Open
                            </Link>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Link
                                href={`/quiz/${quiz.id}/edit`}
                                className="bg-secondary text-secondary-foreground p-2 hover:bg-secondary/80 focus:bg-secondary/70 rounded-(--radius-button) font-semibold cursor-pointer w-full sm:w-auto text-center"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="border border-red-500/40 text-red-300 p-2 hover:bg-red-500/10 rounded-(--radius-button) font-semibold cursor-pointer w-full sm:w-auto"
                              >
                                Delete
                              </button>
                            </div>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-foreground">No created assessments found</p>
            )}
            </div>

            {copyTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
                <div className="card w-full max-w-md p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Copy Assessment</h2>
                    <button
                      type="button"
                      onClick={() => setCopyTarget(null)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-muted-foreground">
                    This will create a new copy with a different join code.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCopyTarget(null)}
                      className="bg-secondary text-secondary-foreground p-2 hover:bg-secondary/80 focus:bg-secondary/70 rounded-(--radius-button) font-semibold cursor-pointer"
                      disabled={isCopying}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyQuiz}
                      className="bg-primary text-primary-foreground p-2 hover:bg-primary/80 focus:bg-primary/70 rounded-(--radius-button) font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isCopying}
                    >
                      {isCopying ? "Copying..." : "Copy Assessment"}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  )
}

export default Page
