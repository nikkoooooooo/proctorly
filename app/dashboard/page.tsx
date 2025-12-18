import { getSession } from "@/lib/auth-actions"
import { getUserNameFromSession } from "@/lib/user";

async function dashboard() {
    const session = await getSession()

    let userName: string | null = null;

    if (session) {
        userName = await getUserNameFromSession(session.id);
    }

  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col w-full  items-center">
        <div className="max-w-7xl w-full px-4">
            <div className="mt-5 flex flex-col gap-2">
                <h2 className="text-white text-4xl font-bold">Dashboard</h2>
                <p className="text-white text-xl">Welcome back, {userName}</p>
            </div>


            
        </div>
        


    </div>
  )
}

export default dashboard