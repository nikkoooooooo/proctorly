import { db } from "./db";
import { session, user } from "./schema";
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
