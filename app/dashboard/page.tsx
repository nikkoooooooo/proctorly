"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast";
// import confetti from "canvas-confetti";
import confetti from "canvas-confetti"

import QuizStatCard from "@/components/QuizStatCard"
import { authClient } from "@/client/auth-client";
import { getUserBySessionIdAction, getUserNameFromQuizAction } from "@/lib/user/actions/getUserName"
import { getUserQuizAction } from "@/lib/user/actions/getUserQuizAction"
import getQuizThroughCodeAction from "@/lib/quiz/actions/getQuizThroughCodeAction"
import { joinQuizAction } from "@/lib/quiz/actions/joinQuizAction"
import { getUserJoinedQuizAction } from "@/lib/user/actions/getUserJoinedQuizAction"
import QuizBox from "@/components/QuizBox";

interface Quiz {
  id: string
  title: string
  joinCode: string
  description?: string | null
}

export default function Dashboard() {
  const { data } = authClient.useSession()
  const user = data?.user
  const session = data?.session


  const [userName, setUserName] = useState<string>("username")
  const [planBadge, setPlanBadge] = useState<string | null>(null)
//   const [session, setSession] = useState<any>(null)
  const [code, setCode] = useState<string>("")

  const [joinQuiz, setJoinQuiz] = useState<Quiz | null>(null)
  const [quizCreatorName, setQuizCreatorName] = useState<string>("")

  const [userCreatedQuiz, setUserCreatedQuiz] = useState<Quiz[]>([])
  const [userJoinedQuiz, setUserJoinedQuiz] = useState<Quiz[]>([])

  const totalQuizCreated = userCreatedQuiz.length
  const totalQuizJoined = userJoinedQuiz.length
  const totalQuizzes = totalQuizCreated + totalQuizJoined

 
  useEffect(() => {
    const fetchUser = async () => {
    //   const currentSession = await getSession()
      if (!user) return
    //   setSession(currentSession)
      if (session) {
          const userResult = await getUserBySessionIdAction(session.id)
          if (userResult.success && userResult.data) {
            const userData = userResult.data.user
            const subscriptionData = userResult.data.subscription
            setUserName(userData.name)
            const isActive = subscriptionData?.status === "active"
            const planId = subscriptionData?.planId
            if (isActive && planId && planId !== "free") {
              setPlanBadge(planId === "pro_plus" ? "Pro Plus" : "Pro")
            } else {
              setPlanBadge(null)
            }
          }
      }
      

      const created = await getUserQuizAction(user.id)
      if (created.quizzes) setUserCreatedQuiz(created.quizzes)

      const joined = await getUserJoinedQuizAction(user.id)
      if (joined.quizzes) setUserJoinedQuiz(joined.quizzes)
    }
    fetchUser()
  }, [user])

  // ----------------------
  // FIND QUIZ BY CODE
  // ----------------------
  const findQuizThroughCode = async () => {
    try {
      const quizResult = await getQuizThroughCodeAction(code)
      if (!quizResult?.quiz) {
        toast.error("Quiz not found!", {
          icon: "⚠️",
          style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
          duration: 5000,
        });
        return
      }

      // fix null description
      const quizSafe: Quiz = {
        ...quizResult.quiz,
        description: quizResult.quiz.description ?? undefined
      }

      setJoinQuiz(quizSafe)

      const creatorResult = await getUserNameFromQuizAction(quizResult.quiz.id)
      setQuizCreatorName(creatorResult.success && creatorResult.username ? creatorResult.username : "Unknown")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), {
        icon: "⚠️",
        style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
        duration: 5000,
      });
    }
  }

  // ----------------------
  // DELETE QUIZ
  // ----------------------

  // ----------------------
  // JOIN QUIZ
  // ----------------------
  const handleJoinQuiz = async () => {
    if (!joinQuiz || !session) return
    try {
      const result = await joinQuizAction(joinQuiz.id, session.userId)
      if (result.success) {
        // 🎉 Success toast
        toast.success(result.message as string, {
          icon: "✅",
          style: { background: "#ffffff", color: "#2563eb", fontWeight: "bold" },
          duration: 4000,
        })

        // 🎊 Confetti animation
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        })

        setUserJoinedQuiz(prev => [...prev, joinQuiz])
        setJoinQuiz(null)
        setCode("")
      } else {
        toast.error(result.error as string, {
          icon: "⚠️",
          style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
          duration: 5000,
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), {
        icon: "⚠️",
        style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
        duration: 5000,
      });
    }
  }

  if (!session) {
    return <p className="text-xl text-center mt-80 text-muted">Please log in to access this page</p>
  }

  // ----------------------
  // JSX
  // ----------------------
  return (
    <div className="bg-background min-h-screen flex flex-col w-full items-center space-y-6">
      <div className="max-w-7xl w-full px-4">
        {/* Header */}
        <div className="mt-5 flex flex-col gap-2">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-3 flex-col md:flex-row justify-center">
              <h2 className="text-foreground text-4xl font-bold">Dashboard</h2>
              {planBadge && (
                <span className="inline-flex items-center rounded-full bg-amber-300/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-950 shadow-[0_0_0_1px_rgba(146,64,14,0.15)]">
                  {planBadge}
                </span>
              )}
            </div>
            {/* Theme-aware radius so the link still looks rounded in light mode */}
            <Link href="/create-quiz" className="bg-primary hover:bg-primary/90 active:bg-primary/80 cursor-pointer text-primary-foreground p-2 rounded-[var(--radius-button)] font-semibold shadow-sm">
              + Create Quiz
            </Link>
          </div>
          <p className="text-foreground text-xl">Welcome back, {userName}</p>
        </div>

        {/* Join Quiz */}
        <div className="mt-5 w-full">
          <div className="card p-4">
            <h2 className="font-semibold text-2xl">Join Quiz</h2>
            <p className="text-muted-foreground">Enter a 6-character quiz code to join</p>
            <form
              className="w-full flex gap-4 pt-4"
              onSubmit={e => { e.preventDefault(); findQuizThroughCode() }}
            >
              <input
                id="input-code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                /* Theme-aware border so it shows in light mode */
                className="bg-background border border-border rounded-[var(--radius-button)] w-full py-2 px-2 text-xl"
                placeholder="ABC123"
              />
              <button type="submit" className="bg-primary text-primary-foreground py-2 px-6 rounded-[var(--radius-button)] font-semibold w-32 cursor-pointer hover:bg-primary/90 active:bg-primary/80">
                Find Quiz
              </button>
            </form>
          </div>
        </div>

        {/* Quiz to join */}
        {joinQuiz && (
          <div className="p-4 mt-4 border rounded flex justify-between">
            <div>
              <h3 className="font-semibold">{joinQuiz.title}</h3>
              <p>Code: {joinQuiz.joinCode}</p>
              <p>By: {quizCreatorName}</p>
              {joinQuiz.description && <p className="text-muted-foreground">{joinQuiz.description}</p>}
            </div>
            <button onClick={handleJoinQuiz} className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer active:bg-primary/80 p-2 rounded-[var(--radius-button)] font-semibold">
              Join Quiz
            </button>
          </div>
        )}

        {/* Stats */}
        {/* <div className="w-full flex justify-between flex-col lg:flex-row gap flex-wrap mt-6">
          <QuizStatCard title="My Quizzes" value={totalQuizCreated} />
          <QuizStatCard title="Joined Quizzes" value={totalQuizJoined} />
          <QuizStatCard title="Total" value={totalQuizzes} />
        </div> */}

        
        <div className="w-full flex flex-col sm:flex-row
        items-center justify-between mt-5 gap-2 ">
          <QuizBox
            path="/created-quiz"
            emoji="📝"
            quizCount={totalQuizCreated}
            title="Created Quizzes"
            description="Quizzes you've created"
          />

          <QuizBox
            path="/joined-quiz"
            emoji="🤝"
            quizCount={totalQuizJoined}
            title="Joined Quizzes"
            description="Quizzes you've joined"
          />


          <QuizBox
            path=""
            emoji="📊"
            quizCount={totalQuizzes}
            title="Total Quiz Activity"
            description="Total Quizzes"
          />

          {/* <QuizBox
            path="/automation"
            emoji="🤖"
            // quizCount={totalQuizJoined}
            title="Automation"
            description="Automation for your manual works
             coming soon..."
          /> */}
        </div>
      </div>
    </div>
  )
}
