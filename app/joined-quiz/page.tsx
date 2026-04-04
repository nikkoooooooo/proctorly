"use client"
import { authClient } from "@/client/auth-client"
import { getUserJoinedQuizAction } from "@/lib/user/actions/getUserJoinedQuizAction"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"


interface Quiz {
  id: string
  title: string
  joinCode: string
  description?: string | null
  createdAt?: string | Date | null
  expiresAt?: string | Date | null
  isPaidQuiz?: boolean | null
  paidQuizFee?: number | null
  creatorName?: string | null
  attemptStatus?: "completed" | "in_progress" | "not_started"
  attemptId?: string | null
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

function formatPHP(amountInCents?: number | null) {
  if (!amountInCents || amountInCents <= 0) return "₱0"
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amountInCents / 100)
}

function Page() {

    const { data } = authClient.useSession()
    const user = data?.user

    const [userJoinedQuiz, setUserJoinedQuiz] = useState<Quiz[]>([])
    const [paymentStatus, setPaymentStatus] = useState<Record<string, "paid" | "unpaid" | "not_required">>({})
    


    useEffect(() => {
        if (!user?.id) return
        const fetchQuiz = async () => {
            try {
                const joinedQuizzes = await getUserJoinedQuizAction(user?.id)
                if (!joinedQuizzes.quizzes) return
                const sortedQuizzes = [...joinedQuizzes.quizzes].sort((a, b) => {
                  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
                  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
                  return bTime - aTime
                })
                setUserJoinedQuiz(sortedQuizzes)
                const statusEntries = await Promise.all(
                  sortedQuizzes.map(async (quiz) => {
                    const res = await fetch(`/api/quiz-payment/status?quizId=${quiz.id}`)
                    const data = await res.json()
                    return [quiz.id, data.status as "paid" | "unpaid" | "not_required"] as const
                  })
                )
                setPaymentStatus(Object.fromEntries(statusEntries))
            } catch (error) {
                console.error(error)
            }
        }
        fetchQuiz()
    },[data])

    const startPayment = async (quizId: string) => {
      try {
        const res = await fetch("/api/quiz-payment/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId }),
        })
        if (!res.ok) {
          console.error("Checkout failed with status:", res.status)
          return
        }

        const text = await res.text()
        if (!text) return
        const data = JSON.parse(text)
        if (data?.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      } catch (error) {
        console.error(error)
      }
    }
    
  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5">
                <Link href={"/dashboard"} className="text-4xl font-bold">←</Link>
            </div>
            {/* Joined assessments */}
        <div className="w-full mb-10">
            <div className="my-5 flex gap-2 items-center">
                <h2 className="text-2xl font-semibold text-foreground">Joined Assessments</h2>
                <span className="bg-secondary text-secondary-foreground p-2 font-semibold rounded-[var(--radius-button)]">Participant</span>
            </div>
            {userJoinedQuiz.length > 0 ? (
                userJoinedQuiz.map((quiz, i) => (
                <div className="card w-full h-auto p-5 mb-4" key={i}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex flex-col gap-2 items-start w-full sm:max-w-[18rem]">
                            {/*
                              Some older records may have isPaidQuiz unset even if a fee exists,
                              so we treat paidQuizFee as the source of truth for display.
                            */}
                            {(() => {
                              const hasPaidFee = (quiz.paidQuizFee ?? 0) > 0
                              const isPaid = Boolean(quiz.isPaidQuiz) || hasPaidFee
                              return (
                                <>
                            <span className="bg-primary/20 text-primary px-2 py-1 text-sm font-semibold rounded-[var(--radius-button)] w-fit">
                              {quiz.joinCode}
                            </span>
                            <h3 className="text-foreground text-xl font-semibold">
                              {isPaid ? (
                                <span className="flex items-center gap-2">
                                  <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                  <span>{quiz.title}</span>
                                </span>
                              ) : (
                                quiz.title
                              )}
                            </h3>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                              {paymentStatus[quiz.id] === "unpaid"
                                ? "PAYMENT REQUIRED"
                                : quiz.attemptStatus === "completed"
                                  ? "COMPLETED"
                                  : quiz.attemptStatus === "in_progress"
                                    ? "IN PROGRESS"
                                    : "READY TO TAKE"}
                            </span>
                            {isPaid && (
                              <>
                                <p className="text-foreground font-semibold">
                                  {formatPHP(quiz.paidQuizFee)} • Paid Assessment
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  Price set by {quiz.creatorName || "Instructor"}
                                </p>
                              </>
                            )}
                            {quiz.description && <p className="text-muted-foreground mt-2">{quiz.description}</p>}
                            <p className="text-muted-foreground text-sm">
                              Created (PH): {formatPHDateTime(quiz.createdAt)} · Expires:{" "}
                              {quiz.expiresAt ? formatPHDateTime(quiz.expiresAt) : "No expiry"}
                            </p>
                                </>
                              )
                            })()}
                        </div>

                        {/* Uniform button */}
                        {paymentStatus[quiz.id] === "unpaid" ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => startPayment(quiz.id)}
                              className="bg-emerald-500 text-white flex items-center justify-center rounded-[var(--radius-button)] font-semibold cursor-pointer p-2 hover:bg-emerald-600 transition-all w-full sm:w-auto"
                            >
                              Pay {formatPHP(quiz.paidQuizFee)}
                            </button>
                          </div>
                        ) : quiz.attemptStatus === "completed" && quiz.attemptId ? (
                          <Link
                            href={`/quiz/${quiz.id}/results/${quiz.attemptId}`}
                            className="border border-primary/60 text-primary flex items-center justify-center rounded-[var(--radius-button)] font-semibold cursor-pointer p-2 hover:bg-primary/10 transition-all w-full sm:w-auto"
                          >
                            View Result
                          </Link>
                        ) : quiz.attemptStatus === "in_progress" ? (
                          <Link
                            href={`/quiz/${quiz.id}`}
                            className="bg-primary text-primary-foreground flex items-center justify-center rounded-[var(--radius-button)] font-semibold cursor-pointer p-2 hover:bg-primary/80 transition-all w-full sm:w-auto"
                          >
                            Continue Assessment
                          </Link>
                        ) : (
                          <Link
                            href={`/quiz/${quiz.id}`}
                            className="bg-primary text-primary-foreground flex items-center justify-center rounded-[var(--radius-button)] font-semibold cursor-pointer p-2 hover:bg-primary/80 transition-all w-full sm:w-auto"
                          >
                            Take Assessment
                          </Link>
                        )}
                    </div>
                </div>
                ))
            ) : (
                <p className="text-foreground">No joined assessments found</p>
            )}
            </div>
        </div>
    </div>
  )
}

export default Page
