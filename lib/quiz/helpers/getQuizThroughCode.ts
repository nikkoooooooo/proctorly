// lib/helpers/quiz.ts
"use server"

import { db } from "@/lib/db"
import { quiz } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function getQuizByJoinCode(joinCode: string) {
  const result = await db
    .select()
    .from(quiz)
    .where(eq(quiz.joinCode, joinCode))
    .limit(1)

  return result[0] ?? null
}
