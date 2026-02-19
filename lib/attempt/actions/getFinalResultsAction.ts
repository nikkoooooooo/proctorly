
"use server";

import { db } from "@/lib/db";
import { attempt, quiz, user as userTable, question } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getFinalResultsAction(attemptId: string) {
  try {
    // 1️⃣ Fetch the attempt
    const [userAttempt] = await db
      .select({
        id: attempt.id,
        score: attempt.score,
        quizId: attempt.quizId,
        tabSwitchCount: attempt.tabSwitchCount,
      })
      .from(attempt)
      .where(eq(attempt.id, attemptId))
      .execute();

    if (!userAttempt) {
      return { success: false, error: "Attempt not found" };
    }

    // 2️⃣ Fetch quiz title and creator
    const [quizData] = await db
      .select({ title: quiz.title, creatorId: quiz.creatorId })
      .from(quiz)
      .where(eq(quiz.id, userAttempt.quizId))
      .execute();

    if (!quizData) {
      return { success: false, error: "Quiz not found" };
    }

    // 3️⃣ Fetch creator name
    const [creator] = await db
      .select({ name: userTable.name })
      .from(userTable)
      .where(eq(userTable.id, quizData.creatorId))
      .execute();

    // 4️⃣ Fetch total points for this quiz
    const questions = await db
      .select({ points: question.points })
      .from(question)
      .where(eq(question.quizId, userAttempt.quizId))
      .execute();

    const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

    return {
      success: true,
      score: userAttempt.score ?? 0,
      totalPoints,
      tabSwitchCount: userAttempt.tabSwitchCount ?? 0,
      quizTitle: quizData.title,
      quizAuthor: creator?.name ?? "Unknown",
    };
  } catch (error) {
    console.error("Failed to get final results:", error);
    return {
      success: false,
      error: "Could not fetch final results. Please try again in a few seconds.",
    };
  }
}
