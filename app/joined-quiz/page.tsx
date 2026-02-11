"use client"
import { authClient } from "@/client/auth-client"
import { getUserJoinedQuizAction } from "@/lib/user/actions/getUserJoinedQuizAction"
import { useEffect, useState } from "react"
import Link from "next/link"


interface Quiz {
  id: string
  title: string
  joinCode: string
  description?: string | null
  createdAt?: string | Date | null
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

    const [userJoinedQuiz, setUserJoinedQuiz] = useState<Quiz[]>([])
    


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
            } catch (error) {
                console.error(error)
            }
        }
        fetchQuiz()
    },[data])
    
  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5">
                <Link href={"/dashboard"} className="text-4xl font-bold">←</Link>
            </div>
            {/* Joined quizzes */}
        <div className="w-full mb-10">
            <div className="my-5 flex gap-2 items-center">
                <h2 className="text-2xl font-semibold text-foreground">Joined Quizzes</h2>
                <span className="bg-secondary text-secondary-foreground p-2 font-semibold rounded-[var(--radius-button)]">Participant</span>
            </div>
            {userJoinedQuiz.length > 0 ? (
                userJoinedQuiz.map((quiz, i) => (
                <div className="card w-full h-auto p-5 mb-4" key={i}>
                    <div className="flex justify-between items-center gap-10">
                        <div className="flex flex-col gap-2 items-start w-36">
                            <h3 className="text-foreground text-lg font-semibold">{quiz.title}</h3>
                            <span className="bg-primary/20 text-primary p-1 font-semibold rounded-[var(--radius-button)]">{quiz.joinCode}</span>
                        </div>

                        {/* Uniform button */}
                        <Link
                            href={`/quiz/${quiz.id}`}
                            className="bg-primary text-primary-foreground flex items-center justify-center rounded-[var(--radius-button)] font-semibold cursor-pointer p-2 hover:bg-primary/80 transition-all"
                        >
                            Take Quiz
                        </Link>
                    </div>
                    {/* Use muted-foreground for readable description text */}
                    {quiz.description && <p className="text-muted-foreground mt-2">{quiz.description}</p>}
                    <p className="text-muted-foreground mt-2 text-sm">
                      Created (PH): {formatPHDateTime(quiz.createdAt)}
                    </p>
                </div>
                ))
            ) : (
                <p className="text-foreground">No joined quizzes found</p>
            )}
            </div>
        </div>
    </div>
  )
}

export default Page
