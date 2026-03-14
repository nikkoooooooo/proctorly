import { db } from "@/lib/db"
import { quiz, quizEnrollment, quizPayment, user } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { decryptStudentNo } from "@/lib/crypto/studentNo"
import { markQuizPaymentPaidAction } from "@/lib/quiz-payment/actions/markQuizPaymentPaidAction"

export default async function ParticipantsTab({ quizId }: { quizId: string }) {
  const [quizRow] = await db
    .select({ isPaidQuiz: quiz.isPaidQuiz })
    .from(quiz)
    .where(eq(quiz.id, quizId))

  const rawParticipants = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      studentNoEncrypted: user.studentNoEncrypted,
      section: user.section,
      paymentStatus: quizPayment.status,
    })
    .from(quizEnrollment)
    .innerJoin(user, eq(user.id, quizEnrollment.userId))
    .leftJoin(
      quizPayment,
      and(eq(quizPayment.quizId, quizId), eq(quizPayment.userId, user.id))
    )
    .where(eq(quizEnrollment.quizId, quizId))

  const participants = rawParticipants.map((p) => {
    let studentNo: string | null = null
    if (p.studentNoEncrypted) {
      try {
        studentNo = decryptStudentNo(p.studentNoEncrypted)
      } catch {
        studentNo = null
      }
    }
    const { studentNoEncrypted, ...rest } = p
    return { ...rest, studentNo }
  })

  if (participants.length === 0) return <p>No participants yet.</p>

  return (
    <div className="card p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border border-muted-foreground/30 rounded-[var(--radius-button)] overflow-hidden">
          <thead>
            <tr className="text-left border-b border-muted-foreground/20">
              <th className="py-2 px-3">Student</th>
              <th className="py-2 px-3">Student No</th>
              <th className="py-2 px-3">Section</th>
              <th className="py-2 px-3">Email</th>
              {quizRow?.isPaidQuiz && (
                <>
                  <th className="py-2 px-3">Payment Status</th>
                  <th className="py-2 px-3">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.userId} className="border-b border-muted-foreground/10 last:border-b-0">
                <td className="py-2 px-3 font-medium">{p.name}</td>
                <td className="py-2 px-3">{p.studentNo ?? "—"}</td>
                <td className="py-2 px-3">{p.section ?? "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{p.email}</td>
                {quizRow?.isPaidQuiz && (
                  <>
                    <td className="py-2 px-3">
                      {p.paymentStatus === "paid" ? "🟢 Paid" : "🔴 Unpaid"}
                    </td>
                    <td className="py-2 px-3">
                      {p.paymentStatus === "paid" ? (
                        "—"
                      ) : (
                        <form action={markQuizPaymentPaidAction}>
                          <input type="hidden" name="quizId" value={quizId} />
                          <input type="hidden" name="userId" value={p.userId} />
                          <button type="submit" className="text-primary font-semibold">
                            Mark as Paid
                          </button>
                        </form>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
