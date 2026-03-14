"use server"

import { db } from "@/lib/db"
import { quizPayment } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { v4 as uuid } from "uuid"
import { revalidatePath } from "next/cache"

export async function markQuizPaymentPaidAction(formData: FormData): Promise<void> {
  const quizId = String(formData.get("quizId") || "")
  const userId = String(formData.get("userId") || "")

  if (!quizId || !userId) {
    return
  }

  const [existing] = await db
    .select()
    .from(quizPayment)
    .where(and(eq(quizPayment.quizId, quizId), eq(quizPayment.userId, userId)))

  if (existing) {
    await db
      .update(quizPayment)
      .set({ status: "paid", source: "manual", paidAt: new Date() })
      .where(and(eq(quizPayment.quizId, quizId), eq(quizPayment.userId, userId)))
  } else {
    await db.insert(quizPayment).values({
      id: uuid(),
      quizId,
      userId,
      status: "paid",
      source: "manual",
      paidAt: new Date(),
    })
  }

  revalidatePath(`/quiz/${quizId}/view`)
}
