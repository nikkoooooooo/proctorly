"use client"

import JoinQuizInput from "@/components/JoinQuizInput";
import QuizStatCard from "@/components/QuizStatCard";
import { getSession } from "@/lib/auth-actions"
import { getUserName } from "@/lib/actions/getUserName";
import { useState, useEffect, use} from "react"
import getQuizThroughCodeAction from "@/lib/actions/getQuizThroughCodeAction";
import { Divide } from "lucide-react";


interface Quiz{
    title: string,
    joinCode: string
}

function dashboard() {
      const [userName, setUserName] = useState<string | null>("username")
      const [session, setSession] = useState<any>("")
      const [code, setCode] = useState<string>("")
      const [quiz, setQuiz] = useState<Quiz | null>(null)
      const [quizCreatorName, setQuizCreatorName] = useState<string>("")

      useEffect(() => {
        const fetchUser = async () => {
            const session = await getSession()
            if (session) {
                setSession(session)
                setUserName(await getUserName(session.id))
                
            }
        }
        fetchUser()
      },[])

    // const session = await getSession()

    // let userName: string | null = null;

    // if (session) {
    //     userName = await getUserNameFromSession(session.id);
    // }

    const findQuizThroughCode = async () => {
        const quiz = await getQuizThroughCodeAction(code)
        setQuiz(quiz)

        // if (quiz) {
        //     setQuizCreatorName(await getUserName(quiz.creatorId))
        // }
    }

  return (
    <div className="bg-background min-h-screen flex flex-col w-full  items-center">
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
                        <button className='bg-primary py-2 px-6 rounded-md font-semibold w-32' type="submit">Find Quiz</button>
                    </form>

                </div>
            </div>

            {/* {error && <p className="text-red-500">{error}</p>} */}

            {quiz && (
                <div className="p-4 mt-4 border rounded flex justify-between">
                    <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p>Code: {quiz.joinCode}</p>
                        {/* <p>{quizCreatorName}</p> */}
                        <p>By: Christian Tumamao</p>
                    </div>
                
                    <button className="bg-primary p-2 rounded-md">Join Quiz</button>
                </div>
            )}


            {/* {quiz ? ( <div className="p-4 mt-4 border rounded flex justify-between">
                    <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p>{quiz.joinCode}</p>
                        {/* <p>{quizCreatorName}</p> */}
                        {/* <p>hhh</p>
                    </div>
                
                    <button className="bg-primary p-2 rounded-md">Join Quiz</button>
                </div>) : <div><p>No Quiz Found</p></div>} */}

            <div className="w-full flex justify-between flex-col lg:flex-row gap flex-wrap">
                    <QuizStatCard 
                        title={"My Quizzes"}
                        value={6}
                    />

                     <QuizStatCard 
                        title={"Joined Quizzes"}
                        value={6}
                    />

                     <QuizStatCard 
                        title={"Total"}
                        value={12}
                    />


            </div>

            
        </div>
        


    </div>
  )
}

export default dashboard