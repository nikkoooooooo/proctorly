// app/quiz/[quizId]/results/[attemptId]/page.tsx
import { getFinalResultsAction } from "@/lib/attempt/actions/getFinalResultsAction"
import Link from "next/link"
import DownloadCertificateButton from "@/components/cert/DownloadCertificateButton"

interface ResultPageProps {
  params: {
    quizId: string
    attemptId: string
  }
}

export default async function ResultPage(props: ResultPageProps) {
  // ✅ unwrap the params promise
  const { quizId, attemptId } = await props.params

  let result
  try {
    result = await getFinalResultsAction(attemptId)
  } catch (err) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Result not found</h2>
        <p>{(err as Error).message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col items-center gap-4 text-center">
      <h1 className="text-3xl font-bold">{result.quizTitle}</h1>
      <p className="text-lg">Created By: {result.quizAuthor}</p>
      <p className="text-2xl font-semibold">
        Score: {result.score} / {result.totalPoints} (
        {(result.percentage ?? 0).toFixed(2)}%)
      </p>
      <p className="text-lg text-red-500">Tab Switches: {result.tabSwitchCount}</p>

      <div className="mt-6 w-full max-w-md text-center">
        <p className="mb-6">🎉 Congratulations on completing the Assessment!</p>
        <div className="flex flex-col items-center gap-3">
          {result.certificateEnabled ? (
            <DownloadCertificateButton
              attemptId={attemptId}
              isEligible={result.certificateEligible}
              ineligibleReason={result.certificateIneligibleReason}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Certificates are disabled for this assessment.
            </p>
          )}
          <Link
            href={"/dashboard"}
            className="bg-primary p-2 rounded-[var(--radius-button)] text-primary-foreground font-semibold"
          >
            Go Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
