
"use server";

import { db } from "@/lib/db";
import { quiz } from "@/lib/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { createQuiz, QuestionInput } from "@/lib/quiz/helpers/createQuiz";
import { canCreateQuiz } from "@/lib/billing/entitlements";
const FREE_LIMIT_START = new Date("2026-03-01T00:00:00.000+08:00");

export async function createQuizAction(
  title: string,
  questions: QuestionInput[],
  creatorId: string,
  description: string,
  blurQuestion = false,
  expiresAt?: string | null
) {
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

    const createdQuiz = await createQuiz(
      creatorId,
      title,
      questions,
      description,
      blurQuestion,
      expiresAt
    );

    return { success: true, quiz: createdQuiz };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return {
      success: false,
      error: "Could not create quiz, please try again in a few seconds",
    };
  }
}
