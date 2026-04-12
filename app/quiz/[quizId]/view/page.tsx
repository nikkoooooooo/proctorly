import Link from "next/link"
import { getSession } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import OverviewTab from "./OverviewTab"
import ParticipantsTab from "./ParticipantsTab"
import AttemptsTab from "./AttemptsTab"

export default async function ViewQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")


  const { quizId } = await params
  const { tab } = await searchParams
  const activeTab = tab ?? "overview"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/created-quiz" className="text-xl font-semibold">← Back</Link>
        <h1 className="text-2xl font-bold">View Assessment</h1>
      </div>

      <div className="flex gap-4">
        <Link href="?tab=overview" className={activeTab === "overview" ? "font-semibold" : ""}>Overview</Link>
        <Link href="?tab=participants" className={activeTab === "participants" ? "font-semibold" : ""}>Participants</Link>
        <Link href="?tab=attempts" className={activeTab === "attempts" ? "font-semibold" : ""}>Attempts</Link>
      </div>

      {activeTab === "overview" && <OverviewTab quizId={quizId} />}
      {activeTab === "participants" && <ParticipantsTab quizId={quizId} />}
      {activeTab === "attempts" && <AttemptsTab />}
    </div>
  )
}
