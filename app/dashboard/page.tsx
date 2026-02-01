"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast";
// import confetti from "canvas-confetti";
import confetti from "canvas-confetti"

import QuizStatCard from "@/components/QuizStatCard"
import { getSession } from "@/lib/auth-actions"
import { authClient } from "@/client/auth-client";
import { getUserBySessionIdAction, getUserNameFromQuizAction } from "@/lib/actions/getUserName"
import { getUserQuizAction } from "@/lib/actions/getUserQuizAction"
import getQuizThroughCodeAction from "@/lib/actions/getQuizThroughCodeAction"
import { deleteQuizAction } from "@/lib/actions/deleteQuizAction"
import { joinQuizAction } from "@/lib/actions/joinQuizAction"
import { getUserJoinedQuizAction } from "@/lib/actions/getUserJoinedQuizAction"
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
          if (userResult.success && userResult.data) setUserName(userResult.data.user.name)
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
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return
    try {
      await deleteQuizAction(quizId)
      setUserCreatedQuiz(prev => prev.filter(q => q.id !== quizId))
      toast.success("Quiz deleted!", {
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
          <div className="flex w-full justify-between">
            <h2 className="text-white text-4xl font-bold">Dashboard</h2>
            <Link href="/create-quiz" className="bg-primary hover:bg-blue-400 active:bg-blue-300 cursor-pointer text-white p-2 rounded-lg font-semibold">
              + Create Quiz
            </Link>
          </div>
          <p className="text-white text-xl">Welcome back, {userName}</p>
        </div>

        {/* Join Quiz */}
        <div className="mt-5 w-full">
          <div className="card p-4">
            <h2 className="font-semibold text-2xl">Join Quiz</h2>
            <p className="text-muted">Enter a 6-character quiz code to join</p>
            <form
              className="w-full flex gap-4 pt-4"
              onSubmit={e => { e.preventDefault(); findQuizThroughCode() }}
            >
              <input
                id="input-code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="bg-background rounded-md w-full py-2 px-2 text-xl"
                placeholder="ABC123"
              />
              <button type="submit" className="bg-primary py-2 px-6 rounded-md font-semibold w-32 cursor-pointer hover:bg-blue-400 active:bg-blue-300">
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
              {joinQuiz.description && <p className="text-muted">{joinQuiz.description}</p>}
            </div>
            <button onClick={handleJoinQuiz} className="bg-primary hover:bg-blue-400 cursor-pointer active:bg-blue-300 p-2 rounded-md font-semibold">
              Join Quiz
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="w-full flex justify-between flex-col lg:flex-row gap flex-wrap mt-6">
          <QuizStatCard title="My Quizzes" value={totalQuizCreated} />
          <QuizStatCard title="Joined Quizzes" value={totalQuizJoined} />
          <QuizStatCard title="Total" value={totalQuizzes} />
        </div>

        
        <div className="w-full flex flex-col sm:flex-row 
        items-center justify-around mt-5 gap-2 p-4">
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
        </div>

        

        {/* Created quizzes
        <div className="w-full mt-5">
          <div className="my-5 flex gap-2 items-center">
            <h2 className="text-2xl font-semibold text-white">My Quizzes</h2>
            <span className="bg-[#3b82f630] text-primary p-2 font-semibold rounded-md">Creator</span>
          </div>
          {userCreatedQuiz.length > 0 ? (
            userCreatedQuiz.map((quiz, i) => (
              <div className="card w-full h-auto p-5 mb-4" key={i}>
                <div className="flex justify-between items-center gap-10">
                   <div className="flex flex-col gap-2 items-start flex-nowrap">
                        <h3 className="text-white text-lg font-semibold">{quiz.title}</h3>
                        <span className="bg-[#3b82f630] text-primary p-1 font-semibold rounded-md">{quiz.joinCode}</span>
                </div>
                  <div className="flex gap-2">
                    <Link href={`/quiz/${quiz.id}/creator`} className="bg-primary p-2 rounded-md font-semibold cursor-pointer text-white hover:bg-blue-700">
                      View
                    </Link>
                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="bg-gray-700 p-2 rounded-md font-semibold cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
                {quiz.description && <p className="text-muted mt-2">{quiz.description}</p>}
              </div>
            ))
          ) : (
            <p className="text-white">No quizzes found</p>
          )}
        </div>

      // {/* Joined quizzes 
        <div className="w-full mb-10">
            <div className="my-5 flex gap-2 items-center">
                <h2 className="text-2xl font-semibold text-white">Joined Quizzes</h2>
                <span className="bg-gray-700 text-white p-2 font-semibold rounded-md">Participant</span>
            </div>
            {userJoinedQuiz.length > 0 ? (
                userJoinedQuiz.map((quiz, i) => (
                <div className="card w-full h-auto p-5 mb-4" key={i}>
                    <div className="flex justify-between items-center gap-10">
                        <div className="flex flex-col gap-2 items-start w-36">
                            <h3 className="text-white text-lg font-semibold">{quiz.title}</h3>
                            <span className="bg-[#3b82f630] text-primary p-1 font-semibold rounded-md">{quiz.joinCode}</span>
                        </div>

                        {/* Uniform button */}
                        {/* <Link
                            href={`/quiz/${quiz.id}`}
                            className="bg-primary text-white flex items-center justify-center rounded-md font-semibold cursor-pointer p-2 hover:bg-blue-700 transition-all"
                        >
                            Take Quiz
                        </Link>
                    </div>
                    {quiz.description && <p className="text-muted mt-2">{quiz.description}</p>}
                </div>
                ))
            ) : (
                <p className="text-white">No joined quizzes found</p>
            )}
            </div>   */}
      </div>
    </div>
  )
}
