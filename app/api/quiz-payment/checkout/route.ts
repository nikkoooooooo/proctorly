import { db } from "@/lib/db"
import { quiz, quizPayment } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { v4 as uuid } from "uuid"
import { getSession } from "@/lib/auth-actions"
import { createPaymongoLink } from "@/lib/billing/paymongo"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId } = await req.json()
    if (!quizId) {
      return Response.json({ error: "Missing quizId" }, { status: 400 })
    }

    const [quizRow] = await db
      .select({ title: quiz.title, paidQuizFee: quiz.paidQuizFee })
      .from(quiz)
      .where(eq(quiz.id, quizId))

    if (!quizRow?.paidQuizFee || quizRow.paidQuizFee < 10000) {
      return Response.json({ error: "Minimum quiz fee is 100" }, { status: 400 })
    }

    const checkout = await createPaymongoLink({
      amount: quizRow.paidQuizFee,
      description: `Quiz fee for ${quizRow.title}`,
      remarks: `Quiz ${quizId} - User ${session.userId}`,
      currency: "PHP",
    })

    await db.insert(quizPayment).values({
      id: uuid(),
      quizId,
      userId: session.userId,
      status: "pending",
      source: "paymongo",
      paymongoLinkId: checkout.linkId,
      paymongoLinkReference: checkout.referenceNumber,
    })

    return Response.json({ checkoutUrl: checkout.checkoutUrl })
  } catch (error) {
    console.error("Failed to create quiz payment checkout:", error)
    return Response.json({ error: "Failed to start checkout" }, { status: 500 })
  }
}
