import { db } from "@/lib/db"
import { quizEnrollment, user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { decryptStudentNo } from "@/lib/crypto/studentNo"

export default async function ParticipantsTab({ quizId }: { quizId: string }) {
  const rawParticipants = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      studentNoEncrypted: user.studentNoEncrypted,
      section: user.section,
    })
    .from(quizEnrollment)
    .innerJoin(user, eq(user.id, quizEnrollment.userId))
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
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.userId} className="border-b border-muted-foreground/10 last:border-b-0">
                <td className="py-2 px-3 font-medium">{p.name}</td>
                <td className="py-2 px-3">{p.studentNo ?? "—"}</td>
                <td className="py-2 px-3">{p.section ?? "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{p.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
