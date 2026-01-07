"use server"

import { db } from "../db"
import { quizEnrollment } from "../schema"
import { eq, and } from "drizzle-orm/expressions"
import { v4 as uuid } from "uuid"; // generate unique IDs

export async function joinQuiz(quizId: string, userId: string) {
  // Check if the user has already joined this quiz
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
    // Already joined, return existing enrollment or just throw error
    return { message: "User already joined this quiz", enrollmentId: existing[0].id };
  }

  // If not joined yet, create new enrollment
  const enrollmentId = uuid();

  const [newEnrollment] = await db
    .insert(quizEnrollment)
    .values({
      id: enrollmentId,
      quizId,
      userId
    })
    .returning(); // <-- returns the inserted row

  return newEnrollment;
}



// TODO!!!!!!!!!!!!!!!!!!!
// create a helper for joiningquiz 
// create a helper for rendering in the dashbaord that the user 
// joined quizzes


// and also server action for both