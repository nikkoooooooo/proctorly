// components/AlreadyTakenPage.tsx
import { getQuizByIdAction } from "@/lib/actions/getQuizByIdAction"
// import { getFinalResultsAction } from "@/lib/actions/getFinalResultsAction"
import Link from "next/link"

interface AlreadyTakenPageProps {
  quizId: string
}

export default async function AlreadyTakenPage({ quizId }: AlreadyTakenPageProps) {
  const quiz = await getQuizByIdAction(quizId)
  // const { score } = await getFinalResultsAction()

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4">
      <div className="card w-96 p-6 text-center shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          You have already taken the quiz:
        </h2>
        <h3 className="text-lg font-semibold mb-2">{quiz.quiz?.title}</h3>
        {quiz.quiz?.description && (
          <p className="text-sm text-gray-600 mb-6">{quiz.quiz.description}</p>
        )}
        <p className="text-sm text-gray-600 mb-6">
          Retaking is not allowed. You can view your results if available.
          {}
        </p>

        <Link
            href={"/dashboard"}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90 transition"
            >
            Go Back to Dashboard
        </Link>
            
      </div>
    </div>
  )
}
