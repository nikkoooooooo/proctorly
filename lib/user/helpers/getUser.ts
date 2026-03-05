import { db } from "@/lib/db";
import { quiz, session, subscription, user } from "@/lib/schema";
import { eq } from "drizzle-orm/expressions";
import { decryptStudentNo } from "@/lib/crypto/studentNo";

// sessionId could come from getSession() in Better Auth
export async function getUserById(sessionId: string) {
  const result = await db
    .select({
      session,
      user,
      subscription,
    })
    .from(session)
    .innerJoin(user, eq(user.id, session.userId))
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(eq(session.id, sessionId))
    .limit(1)
    .execute()

  if (!result || result.length === 0) return null

  const row = result[0]
  const encrypted = row.user.studentNoEncrypted
  let studentNo: string | null = null
  if (encrypted) {
    try {
      studentNo = decryptStudentNo(encrypted)
    } catch {
      studentNo = null
    }
  }

  return {
    session: row.session,
    user: {
      ...row.user,
      studentNo,
    },
    subscription: row.subscription ?? null,
  }
}



export async function getUserNameFromQuiz(quizId: string) {
  const result = await db
    .select({ name: user.name })      // select only the name
    .from(quiz)
    .innerJoin(user, eq(user.id, quiz.creatorId)) // knowing who is the creator we talking
    .where(eq(quiz.id, quizId))  // filtering what quiz we want to get by that creator
    .limit(1)
    .execute()  // returns an array

  return result[0]?.name ?? null;  // first element's name or null
}
