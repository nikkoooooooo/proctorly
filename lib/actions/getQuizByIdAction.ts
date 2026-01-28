"use server";

import { db } from "@/lib/db";
import { quiz } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getQuizByIdAction(quizId: string) {
  try {
    const [quizData] = await db
      .select()
      .from(quiz)
      .where(eq(quiz.id, quizId))
      .execute();

    if (!quizData) {
      return { success: false, error: "Quiz not found" };
    }

    return { success: true, quiz: quizData };
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return {
      success: false,
      error: "Could not fetch quiz. Please try again in a few seconds.",
    };
  }
}
