import { getQuizAttemptsAction } from "@/lib/actions/getQuizAttemptsAction"

interface TeacherPageProps {
  params: { quizId: string }
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { quizId } = await params

  // 1️⃣ Fetch attempts
  const attempts = await getQuizAttemptsAction(quizId)

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-white mb-6">Students Attempts</h1>

      {attempts.attempts?.length === 0 ? (
        <p className="text-muted">No students have attempted this quiz yet.</p>
      ) : (
       <div className="w-full max-w-7xl mx-auto px-4">
  <div className="flex flex-col gap-4 w-full">
    {attempts.attempts ? attempts.attempts.map((a) => (
      <div
        key={a.attemptId}
        className="card bg-[#1f1f1f] p-4 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center w-full"
      >
        {/* Left: Name & Email */}
        <div className="mb-2 md:mb-0">
          <h3 className="text-lg font-semibold text-white wrap-break-word">{a.name}</h3>
          <p className="text-muted text-sm  wrap-break-word">{a.email}</p>
        </div>

        {/* Right: Score, Tab switches, Completed */}
        <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
          <p className="text-white font-semibold text-sm">Score: {a.score ?? 0}</p>
          <p className="text-red-500 font-semibold text-sm">Tab switches: {a.tabSwitchCount}</p>
          <p
            className={`px-2 py-1 rounded-md font-semibold text-sm mt-1 sm:mt-0 ${
              a.completed ? "bg-green-600 text-white" : "bg-gray-600 text-white"
            }`}
          >
            {a.completed ? "Completed" : "Ongoing"}
          </p>
        </div>
      </div>
    )):
      <p>no students attempt</p> 
      }
  </div>
</div>


      )}
    </div>
  )
}
