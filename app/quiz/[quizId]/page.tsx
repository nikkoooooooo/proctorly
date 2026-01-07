// app/quiz/[quizId]/page.tsx
import QuizMainPageClient from "./QuizMainPageClient"

interface PageProps {
  params: { quizId: string }
}

export default async function Page({ params }: PageProps) {
  const { quizId } = await params 
  return <QuizMainPageClient quizId={quizId} />
}
