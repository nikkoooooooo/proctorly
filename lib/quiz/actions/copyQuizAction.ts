"use server";

import { db } from "@/lib/db";
import { quiz } from "@/lib/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { canCreateQuiz } from "@/lib/billing/entitlements";
import { copyQuiz } from "@/lib/quiz/helpers/copyQuiz";

const FREE_LIMIT_START = new Date("2026-03-01T00:00:00.000+08:00");

export async function copyQuizAction(quizId: string, creatorId: string) {
  try {
    const [{ count: existingQuizCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quiz)
      .where(
        and(
          eq(quiz.creatorId, creatorId),
          gte(quiz.createdAt, FREE_LIMIT_START)
        )
      );

    const canCreate = await canCreateQuiz(creatorId, existingQuizCount ?? 0);
    if (!canCreate) {
      return {
        success: false,
        error: "Quiz limit reached for your plan.",
      };
    }

    const result = await copyQuiz(quizId, creatorId);

    return {
      success: true,
      quizId: result.quizId,
      joinCode: result.joinCode,
      quiz: result.quiz,
    };
  } catch (error) {
    console.error("Failed to copy quiz:", error);
    return {
      success: false,
      error: "Could not copy quiz. Please try again in a few seconds.",
    };
  }
}
