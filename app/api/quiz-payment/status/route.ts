import { db } from "@/lib/db"
import { quizPayment, quiz } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { getSession } from "@/lib/auth-actions"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get("quizId")
  if (!quizId) {
    return Response.json({ error: "Missing quizId" }, { status: 400 })
  }

  const [quizRow] = await db
    .select({ isPaidQuiz: quiz.isPaidQuiz })
    .from(quiz)
    .where(eq(quiz.id, quizId))

  if (!quizRow?.isPaidQuiz) {
    return Response.json({ status: "not_required" })
  }

  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [paid] = await db
    .select()
    .from(quizPayment)
    .where(
      and(
        eq(quizPayment.quizId, quizId),
        eq(quizPayment.userId, session.userId),
        eq(quizPayment.status, "paid")
      )
    )

  return Response.json({ status: paid ? "paid" : "unpaid" })
}
