
"use server";

import { db } from "@/lib/db";
import { quiz } from "@/lib/schema";
import { eq } from "drizzle-orm"

export async function getQuizProctoringByIdAction(quizId: string) {
  try {
    const [quizData] = await db
      .select({
        id: quiz.id,
        title: quiz.title,
        blurQuestion: quiz.blurQuestion,
        // disableCopyPaste: quiz.disableCopyPaste,
        // tabMonitoring: quiz.tabMonitoring,
      })
      .from(quiz)
      .where(eq(quiz.id, quizId));

    if (!quizData) {
      return { success: false, error: "Quiz not found" };
    }

    return { success: true, quiz: quizData };
  } catch (err) {
    console.error("Failed to fetch quiz proctoring:", err);
    return { success: false, error: "Failed to fetch quiz proctoring settings" };
  }
}
