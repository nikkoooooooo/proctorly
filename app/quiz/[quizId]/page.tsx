// app/quiz/[quizId]/page.tsx
import { redirect } from "next/navigation"
import QuizMainPageClient from "./QuizMainPageClient"
import { checkAttemptAction } from "@/lib/attempt/actions/checkAttemptAction"
import { getSession } from "@/lib/auth-actions"
import AlreadyTakenPage from "./AlreadyTakenPage"

interface PageProps {
  params: { quizId: string }
}

export default async function Page({ params }: PageProps) {
  const { quizId } = await params // remove await

  // 1️⃣ Get session
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  // 2️⃣ Check existing attempt
  const attemptCheck = await checkAttemptAction({ 
    quizId, 
    userId: session.userId 
  })

  if (attemptCheck.attempt?.isCompleted) {
    return <AlreadyTakenPage quizId={quizId} attemptId={attemptCheck.attempt.id}/> // no return needed
  }

  // 3️⃣ Render quiz client
  return <QuizMainPageClient quizId={quizId} />
}
