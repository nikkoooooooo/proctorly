import CreatorAttemptsPage from "@/app/quiz/[quizId]/creator/page"

export default async function AttemptsTab({ quizId }: { quizId: string }) {
  return (
    <div className="w-full">
      <CreatorAttemptsPage params={{ quizId }} />
    </div>
  )
}
