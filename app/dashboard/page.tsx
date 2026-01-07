"use client"

import QuizStatCard from "@/components/QuizStatCard";
import { getSession } from "@/lib/auth-actions"
import { getUserName, getUserNameFromQuizAction } from "@/lib/actions/getUserName";
import { getUserQuizAction } from "@/lib/actions/getUserQuizAction";
import { useState, useEffect } from "react"
import getQuizThroughCodeAction from "@/lib/actions/getQuizThroughCodeAction";
import { deleteQuizAction } from "@/lib/actions/deleteQuizAction";
import  { joinQuizAction }  from "@/lib/actions/joinQuizAction"
import { getUserJoinedQuizAction } from "@/lib/actions/getUserJoinedQuizAction";
import Link from "next/link";

interface Quiz{
    title: string,
    joinCode: string,
    id: string
    
}



function dashboard() {
      const [userName, setUserName] = useState<string | null>("username")
      const [session, setSession] = useState<any>("")
      const [code, setCode] = useState<string>("")
      const [joinQuiz, setJoinQuiz] = useState<Quiz | null>(null)
      const [userCreatedQuiz, setUserCreatedQuiz] = useState<any[]>([])
      const [userJoinedQuiz, setUserJoinedQuiz] = useState<any[]>([])
      const [quizCreatorName, setQuizCreatorName] = useState<string>("")

      const totalQuizCreated = userCreatedQuiz.length
      const totalQuizJoined = userJoinedQuiz.length
      const totalQuizzes = totalQuizCreated + totalQuizJoined

      useEffect(() => {
        const fetchUser = async () => {
            const session = await getSession()
            if (session) {
                const userCreatedQuizzes = await getUserQuizAction(session.userId)
                const userJoinedQuizzes = await getUserJoinedQuizAction(session.userId)
                setSession(session)
                setUserName(await getUserName(session.id))
                setUserCreatedQuiz(userCreatedQuizzes)
                setUserJoinedQuiz(userJoinedQuizzes)
                
            }
        }
        fetchUser()
      },[])


    const findQuizThroughCode = async () => {
        const quiz = await getQuizThroughCodeAction(code)
        const username = await getUserNameFromQuizAction(quiz.id)
        setQuizCreatorName(username)
        setJoinQuiz(quiz)

    }

    const deleteQuiz = async (quizId: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this quiz?");
        if (!confirmDelete) return;


        try {
            await deleteQuizAction(quizId)

            setUserCreatedQuiz(prev => prev.filter(q => q.id !== quizId))

        } catch (err) {
            console.error("Failed to delete quiz:", err);
            alert("Failed to delete quiz");
        }
    }


    const handleJoinQuiz = async () => {

        if (joinQuiz) {
            try {
                await joinQuizAction(joinQuiz?.id, session.userId )
                alert("successfully join")
            } catch (error) {
                alert("Cant Join Quiz")
            }
        } 
    }   

  return (
    <div className="bg-background min-h-screen flex flex-col w-full items-center space-y-6">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5 flex flex-col gap-2">
                {session ? (<><p className="text-white">test, there is a session</p></>) : 
                (<><p className="text-white">there is no session</p></>)}
                <h2 className="text-white text-4xl font-bold">Dashboard</h2>
                <p className="text-white text-xl">Welcome back, {userName}</p>
            </div>
            
            <div className="mt-5 w-full">
                <div className='card p-4'>
                    <div>
                        <h2 className='font-semibold text-2xl'>Join Quiz</h2>
                        <p className='text-muted'>Enter a 6-character quiz code to join</p>
                    </div>
     
                    <form className='w-full flex gap-4 pt-4' onSubmit={(e) => {e.preventDefault(), findQuizThroughCode()}}>
                        <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-background rounded-md w-full py-2 px-2 text-xl"
                            placeholder='ABC123'
                            />
                        <button className='bg-primary py-2 px-6 rounded-md 
                        font-semibold w-32 cursor-pointer hover:bg-blue-400' type="submit">Find Quiz</button>
                    </form>

                </div>
            </div>

            {/* {error && <p className="text-red-500">{error}</p>} */}

            {joinQuiz && (
                <div className="p-4 mt-4 border rounded flex justify-between">
                    <div>
                        <h3 className="font-semibold">{joinQuiz.title}</h3>
                        <p>Code: {joinQuiz.joinCode}</p>
                        <p>By: {quizCreatorName}</p>
                    </div>

                    <form action={handleJoinQuiz}>
                        <button className="bg-primary p-2 rounded-md" type="submit">Join Quiz</button>
                    </form>
                </div>
            )}


            <div className="w-full flex justify-between flex-col lg:flex-row gap flex-wrap">
                    <QuizStatCard 
                        title={"My Quizzes"}
                        value={totalQuizCreated}
                    />

                     <QuizStatCard 
                        title={"Joined Quizzes"}
                        value={totalQuizJoined}
                    />

                     <QuizStatCard 
                        title={"Total"}
                        value={totalQuizzes}
                    />
            </div>

            {/* Created by user Quizzes */}
            <div className="w-full">
                <div className="my-5 flex gap-2 items-center">
                    <h2 className="text-2xl font-semibold text-white">My Quizzes</h2>
                    <span 
                        className="bg-[#3b82f630] text-primary p-2 font-semibold rounded-md">
                        Creator
                    </span>
                </div>

                {userCreatedQuiz.length > 0 ? (
                    userCreatedQuiz.map((quiz, i) => (
                    <div className="card w-full h-auto p-5 mb-4" key={i}>
                        <div className="flex justify-between items-center gap-10">
                            <div className="flex gap-2 items-center">
                                <h3 
                                className="text-white text-lg font-semibold p-0 m-0">
                                    {quiz.title}
                                </h3>

                                <span 
                                className="bg-[#3b82f630] text-primary p-1 font-semibold rounded-md">
                                    {quiz.joinCode}
                                </span>
                            </div>

                            <div>
                                <button 
                                    onClick={() => deleteQuiz(quiz.id)}
                                    className="bg-gray-700 p-2 rounded-md font-semibold cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>


                        <div className="mt-2">
                            <p className="text-muted mb-2">
                                {quiz.description}
                            </p>
                            <p className="text-muted">📝3 Questions</p>
                        </div>
                    </div>
                ))
                ): (
                    <p>no quizzes found</p>
                )}

            </div>


            {/* JOINED QUIZZES CARD */}
            <div className="w-full mb-10">
                <div className="my-5 flex gap-2 items-center">
                    <h2 className="text-2xl font-semibold text-white">Joined Quizzes</h2>
                    <span 
                        className="bg-gray-700 text-white p-2 font-semibold rounded-md">
                        Participant
                    </span>
                </div>

                {userJoinedQuiz.length > 0 ? (
                    userJoinedQuiz.map((quiz, i) => (
                        <div className="card w-full h-auto p-5 mb-4" key={i}>
                            <div className="flex justify-between items-center gap-10">
                                <div className="flex flex-col gap-2 items-start flex-nowrap">
                                    <h3 
                                    className="text-white text-lg font-semibold p-0 m-0">
                                        {quiz.title}
                                    </h3>

                                    <span 
                                    className="bg-[#3b82f630] text-primary p-1 font-semibold rounded-md">
                                        {quiz.joinCode}
                                    </span>
                                </div>

                                <div className="flex gap-2 h-auto w-40">
                                    <Link href={`/quiz/${quiz.id}`}
                                        className="bg-primary flex justify-center w-40  rounded-md font-semibold cursor-pointer">
                                        <button 
                                        >Take Quiz
                                        </button>
                                    </Link>
                                    
                                    <button className="bg-gray-700 p-2 rounded-md font-semibold cursor-pointer">Leave</button>
                                </div>
                            </div>


                            <div className="mt-2">
                                <p className="text-muted mb-2">
                                    {quiz.description}
                                </p>
                                <p className="text-muted">📝3 Questions</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>no joined quizzes found</p>
                )}

            </div>

            
        </div>
        


    </div>
  )
}

export default dashboard