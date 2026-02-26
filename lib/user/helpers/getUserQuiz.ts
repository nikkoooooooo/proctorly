"use server"

import { db } from "@/lib/db";
import { quiz, attempt } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";



// 


export async function getUserQuiz(creatorId: string) {
  const result = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      joinCode: quiz.joinCode,
      createdAt: quiz.createdAt,
      attemptCount: sql<number>`count(${attempt.id})`.as("attemptCount"),
    })
    .from(quiz)
    .leftJoin(attempt, eq(attempt.quizId, quiz.id))
    .where(eq(quiz.creatorId, creatorId))
    .groupBy(quiz.id)
    .execute();

  return result.map((row) => ({
    ...row,
    attemptCount: Number(row.attemptCount ?? 0),
  }));
}
