"use server"

import { db } from "@/lib/db"
import { eq } from "drizzle-orm/expressions";
import { quiz, session, user, quizEnrollment } from "@/lib/schema";




export async function getUserJoinedQuiz(userId: string) {
    const result = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      joinCode: quiz.joinCode,
      description: quiz.description,
      createdAt: quiz.createdAt,
    })
    .from(quizEnrollment)
    .innerJoin(quiz, eq(quizEnrollment.quizId, quiz.id))
    .where(eq(quizEnrollment.userId, userId))
    .execute()


    return result

}


// TODO:


// CREATE HELPER FOR GETTING THE USER JOINED QUIZ 
// CREATE SERVER ACTION FOR THAT HELPER
// MAKE THAT RUN IN THE DASHBOARD
// CREATE THE QUIZ PAGE 
// MAKE THIS CORE
