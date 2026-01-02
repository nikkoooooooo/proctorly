"use server"

import { db } from "../db";
import { quiz } from "../schema";
import { eq } from "drizzle-orm/expressions";


export async function deleteQuiz(quizId: string) {
    await db 
        .delete(quiz)
        .where(eq(quiz.id, quizId))


    return { success: true }


}