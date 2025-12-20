import JoinQuizInput from "@/components/JoinQuizInput";
import QuizStatCard from "@/components/QuizStatCard";
import { getSession } from "@/lib/auth-actions"
import { getUserNameFromSession } from "@/lib/user";

async function dashboard() {
    const session = await getSession()

    let userName: string | null = null;

    if (session) {
        userName = await getUserNameFromSession(session.id);
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
                <JoinQuizInput/>
            </div>

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