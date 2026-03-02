import { db } from "@/lib/db";
import { plan, subscription } from "@/lib/schema";
import { eq } from "drizzle-orm";

type PlanFeatures = {
  maxQuizzesCreated: number;
  maxQuestionsPerQuiz: number;
  maxAttemptsPerQuiz: number;
  maxImageQuestionsPerQuiz: number;
};

export async function getPlanForUser(userId: string) {
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId));

  const isExpired =
    sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();

  if (!sub || sub.status !== "active" || isExpired) {
    const [freePlan] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, "free"));
    return freePlan;
  }

  const [planRow] = await db
    .select()
    .from(plan)
    .where(eq(plan.id, sub.planId));
  return planRow;
}

export async function canCreateQuiz(userId: string, existingQuizCount: number) {
  const planRow = await getPlanForUser(userId);
  const features = planRow.features as PlanFeatures;
  return existingQuizCount < features.maxQuizzesCreated;
}

export async function canCreateQuestion(
  userId: string,
  questionCount: number
) {
  const planRow = await getPlanForUser(userId);
  const features = planRow.features as PlanFeatures;
  return questionCount <= features.maxQuestionsPerQuiz;
}

export async function canUseImage(userId: string, imageCount: number) {
  const planRow = await getPlanForUser(userId);
  const features = planRow.features as PlanFeatures;
  return imageCount <= features.maxImageQuestionsPerQuiz;
}

export async function canAttemptQuiz(
  userId: string,
  quizAttemptCount: number
) {
  const planRow = await getPlanForUser(userId);
  const features = planRow.features as PlanFeatures;
  return quizAttemptCount < features.maxAttemptsPerQuiz;
}
