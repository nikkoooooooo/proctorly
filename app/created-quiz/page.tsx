"use client"
import { authClient } from "@/client/auth-client"
import { getUserJoinedQuiz } from "@/lib/helpers/getUserJoinedQuiz"
import { getUserQuizAction } from "@/lib/actions/getUserQuizAction"
import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { deleteQuizAction } from "@/lib/actions/deleteQuizAction"


interface Quiz {
  id: string
  title: string
  joinCode: string
  description?: string | null
}

function page() {

    const { data } = authClient.useSession()
    const user = data?.user
    const session = data?.session

    const [userCreatedQuiz, setUserCreatedQuiz] = useState<Quiz[]>([])
    


    useEffect(() => {
        if (!user?.id) return
        const fetchQuiz = async () => {
            try {
                const createdQuizzes = await getUserQuizAction(user?.id)
                if (!createdQuizzes.quizzes) return
                setUserCreatedQuiz(createdQuizzes.quizzes)
            } catch (error) {
                console.error(error)
            }
        }
        fetchQuiz()
    },[data])

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
    
  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5">
                <Link href={"/dashboard"} className="text-4xl font-bold">←</Link>
            </div>
            {/* Created quizzes */}
        <div className="w-full mb-10">
            <div className="my-5 flex gap-2 items-center">
                <h2 className="text-2xl font-semibold text-white">Created Quizzes</h2>
                <span className="bg-gray-700 text-white p-2 font-semibold rounded-md">Creator</span>
            </div>
            {userCreatedQuiz.length > 0 ? (
                userCreatedQuiz.map((quiz, i) => (
                <div className="card w-full h-auto p-5 mb-4" key={i}>
                    <div className="flex justify-between items-center gap-10">
                        <div className="flex flex-col gap-2 items-start w-36">
                            <h3 className="text-white text-lg font-semibold">{quiz.title}</h3>
                            <span className="bg-[#3b82f630] text-primary p-1 font-semibold rounded-md">{quiz.joinCode}</span>
                        </div>

                        {/* Uniform button */}
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
                <p className="text-white">No created quizzes found</p>
            )}
            </div>
        </div>
    </div>
  )
}

export default page