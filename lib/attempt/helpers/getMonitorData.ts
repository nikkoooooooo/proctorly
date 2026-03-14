import { db } from "@/lib/db";
import {
  attempt,
  attemptEvent,
  attemptQuestionProgress,
  quiz,
  quizEnrollment,
  user,
} from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { monitorConfig } from "@/lib/monitor/config";

export async function getMonitorSummary(quizId: string) {
  const onlineCutoff = new Date(Date.now() - monitorConfig.onlineWindowMs);

  const [counts] = await db
    .select({
      active: sql<number>`count(*) filter (where ${attempt.isCompleted} = false and ${attempt.lastSeenAt} > ${onlineCutoff})`.as("active"),
      finished: sql<number>`count(*) filter (where ${attempt.isCompleted} = true)`.as("finished"),
      warnings: sql<number>`count(*) filter (where ${attempt.tabSwitchCount} >= ${monitorConfig.warningTabSwitches})`.as("warnings"),
      offline: sql<number>`count(*) filter (where ${attempt.isCompleted} = false and (${attempt.lastSeenAt} is null or ${attempt.lastSeenAt} <= ${onlineCutoff}))`.as("offline"),
    })
    .from(attempt)
    .where(eq(attempt.quizId, quizId));

  const [meta] = await db
    .select({
      title: quiz.title,
      joinCode: quiz.joinCode,
      startedAt: sql<Date | null>`min(${attempt.startedAt})`.as("startedAt"),
      joined: sql<number>`count(distinct ${quizEnrollment.id})`.as("joined"),
    })
    .from(quiz)
    .leftJoin(quizEnrollment, eq(quizEnrollment.quizId, quiz.id))
    .leftJoin(attempt, eq(attempt.quizId, quiz.id))
    .where(eq(quiz.id, quizId))
    .groupBy(quiz.id, quiz.title, quiz.joinCode);

  return { counts, meta };
}

export async function getMonitorTable(quizId: string) {
  return db
    .select({
      attemptId: attempt.id,
      name: user.name,
      image: user.image,
      tabSwitchCount: attempt.tabSwitchCount,
      completed: attempt.isCompleted,
      lastSeenAt: attempt.lastSeenAt,
      lastActivityAt: attempt.lastActivityAt,
      answered: sql<number>`count(${attemptQuestionProgress.id}) filter (where ${attemptQuestionProgress.isAnswered} = true)`.as("answered"),
      total: sql<number>`count(${attemptQuestionProgress.id})`.as("total"),
    })
    .from(attempt)
    .leftJoin(user, eq(user.id, attempt.userId))
    .leftJoin(attemptQuestionProgress, eq(attemptQuestionProgress.attemptId, attempt.id))
    .where(eq(attempt.quizId, quizId))
    .groupBy(attempt.id, user.id)
    .orderBy(desc(attempt.lastActivityAt))
    .limit(5);
}

export async function getMonitorEvents(quizId: string, limit = 20) {
  return db
    .select({
      type: attemptEvent.type,
      createdAt: attemptEvent.createdAt,
      payload: attemptEvent.payload,
      name: user.name,
      image: user.image,
    })
    .from(attemptEvent)
    .innerJoin(attempt, eq(attempt.id, attemptEvent.attemptId))
    .leftJoin(user, eq(user.id, attempt.userId))
    .where(eq(attempt.quizId, quizId))
    .orderBy(desc(attemptEvent.createdAt))
    .limit(limit);
}
