"use server"

import { db } from "@/lib/db";
import { quiz, session, user } from "@/lib/schema";
import { eq } from "drizzle-orm/expressions";



// 


export async function getUserQuiz(creatorId: string) {
  const result = await db
    .select()
    .from(quiz)
    .where(eq(quiz.creatorId, creatorId))
    .execute(); // returns raw result object

  // return only plain array of quizzes
  return result; // ✅ plain array of objects
}
