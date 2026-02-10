// app/actions/getCurrentUser.ts
import { getSession } from "@/lib/auth-actions";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm"

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.userId))
      .execute()

    return currentUser;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return null;
  }
}
