"use server"

import { db } from "../db"
import { quizEnrollment } from "../schema"
import { eq, and } from "drizzle-orm/expressions"
import { v4 as uuid } from "uuid"

export async function joinQuiz(quizId: string, userId: string) {
  
  const existing = await db
    .select()
    .from(quizEnrollment)
    .where(
      and(
        eq(quizEnrollment.userId, userId),
        eq(quizEnrollment.quizId, quizId)
      )
    );

  if (existing.length > 0) {
    return {
      alreadyJoined: true,
      enrollmentId: existing[0].id,
    };
  }

  const enrollmentId = uuid();

  const [newEnrollment] = await db
    .insert(quizEnrollment)
    .values({
      id: enrollmentId,
      quizId,
      userId
    })
    .returning();

  return {
    alreadyJoined: false,
    enrollment: newEnrollment,
  };
}
