
"use server";

import { db } from "@/lib/db";
import { attempt, user as userTable, question } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { decryptStudentNo } from "@/lib/crypto/studentNo";

export async function getQuizAttemptsAction(quizId: string) {
  try {
    const results = await db
      .select({
        attemptId: attempt.id,
        userId: attempt.userId,
        score: attempt.score,
        tabSwitchCount: attempt.tabSwitchCount,
        completed: attempt.isCompleted,
        name: userTable.name,
        email: userTable.email,
        studentNoEncrypted: userTable.studentNoEncrypted,
        section: userTable.section,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      })
      .from(attempt)
      .leftJoin(userTable, eq(userTable.id, attempt.userId))
      .where(eq(attempt.quizId, quizId))
      .orderBy(desc(attempt.startedAt))
      .execute();

    const questions = await db
      .select({ points: question.points })
      .from(question)
      .where(eq(question.quizId, quizId))
      .execute()

    const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 1), 0)

    const attempts = results.map((a) => {
      let studentNo: string | null = null
      if (a.studentNoEncrypted) {
        try {
          studentNo = decryptStudentNo(a.studentNoEncrypted)
        } catch {
          studentNo = null
        }
      }
      const { studentNoEncrypted, ...rest } = a
      return { ...rest, studentNo, totalPoints }
    })

    return { success: true, attempts };
  } catch (error) {
    console.error("Failed to fetch quiz attempts:", error);
    return {
      success: false,
      error: "Could not load quiz attempts. Please try again in a few seconds.",
    };
  }
}
