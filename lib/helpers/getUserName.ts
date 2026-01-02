import { db } from "../db";
import { quiz, session, user } from "../schema";
import { eq } from "drizzle-orm/expressions";

// sessionId could come from getSession() in Better Auth
export async function getUserNameFromSession(sessionId: string) {
  const result = await db
    .select({ name: user.name })      // select only the name
    .from(session)
    .innerJoin(user, eq(user.id, session.userId)) // join session -> user
    .where(eq(session.id, sessionId))  // filter by session id
    .limit(1)
    .execute()  // returns an array

  return result[0]?.name ?? null;  // first element's name or null
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
