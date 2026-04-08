import { db } from "@/lib/db"
import { attemptAnswer, attemptQuestionProgress, question } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { v4 as uuid } from "uuid";          // generate unique IDs


interface AnswerAttemptProps {
  attemptId: string
  questionId: string
  optionId?: string   // optional for identification questions
  textAnswer?: string
  isCorrect?: boolean
  // Marks an auto-fail (time ran out without an answer)
  isAutoFail?: boolean
}

export async function answerAttemptHelper({
  attemptId,
  questionId,
  optionId,
  textAnswer,
  isCorrect,
  isAutoFail,
}: AnswerAttemptProps) {
  const normalizeAnswer = (
    input: string,
    cfg: { trimWhitespace: boolean; normalize: boolean; caseSensitive: boolean; skipCase?: boolean },
  ) => {
    let value = input
    if (cfg.trimWhitespace) value = value.trim()
    if (cfg.normalize) value = value.replace(/\s+/g, " ")
    if (!cfg.caseSensitive && !cfg.skipCase) value = value.toLowerCase()
    return value
  }

  const matchAnswer = (
    student: string,
    correct: string,
    cfg: { matchStrategy: "exact" | "contains" | "regex"; caseSensitive: boolean; trimWhitespace: boolean; normalize: boolean },
  ) => {
    if (cfg.matchStrategy === "regex") {
      const normalizedStudent = normalizeAnswer(student, {
        trimWhitespace: cfg.trimWhitespace,
        normalize: cfg.normalize,
        caseSensitive: cfg.caseSensitive,
        skipCase: true,
      })
      const flags = cfg.caseSensitive ? "" : "i"
      try {
        return new RegExp(correct, flags).test(normalizedStudent)
      } catch {
        return false
      }
    }

    const normalizedStudent = normalizeAnswer(student, {
      trimWhitespace: cfg.trimWhitespace,
      normalize: cfg.normalize,
      caseSensitive: cfg.caseSensitive,
    })
    const normalizedCorrect = normalizeAnswer(correct, {
      trimWhitespace: cfg.trimWhitespace,
      normalize: cfg.normalize,
      caseSensitive: cfg.caseSensitive,
    })

    if (cfg.matchStrategy === "contains") {
      return normalizedStudent.includes(normalizedCorrect)
    }
    return normalizedStudent === normalizedCorrect
  }

  // Guard: prevent duplicate answers for the same (attempt, question)
  const existing = await db
    .select()
    .from(attemptAnswer)
    .where(
      and(
        eq(attemptAnswer.attemptId, attemptId),
        eq(attemptAnswer.questionId, questionId),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  let computedCorrect = isCorrect
  if (!isAutoFail && !optionId && typeof textAnswer === "string") {
    const [q] = await db
      .select({
        correctAnswers: question.correctAnswers,
        matchStrategy: question.matchStrategy,
        caseSensitive: question.caseSensitive,
        trimWhitespace: question.trimWhitespace,
        normalize: question.normalize,
      })
      .from(question)
      .where(eq(question.id, questionId))
      .limit(1)
      .execute()

    const correctAnswers = Array.isArray(q?.correctAnswers) ? (q?.correctAnswers as string[]) : []
    const matchStrategyValue =
      q?.matchStrategy === "contains" || q?.matchStrategy === "regex" ? q.matchStrategy : "exact"
    const config = {
      matchStrategy: matchStrategyValue as "exact" | "contains" | "regex",
      caseSensitive: q?.caseSensitive ?? false,
      trimWhitespace: q?.trimWhitespace ?? true,
      normalize: q?.normalize ?? false,
    }

    const trimmed = textAnswer.trim()
    computedCorrect =
      trimmed.length > 0 && correctAnswers.some((answer) => matchAnswer(textAnswer, String(answer), config))
  }

  // Save the student's answer first
  const result = await db.insert(attemptAnswer).values({
    id: uuid(),
    attemptId,
    questionId,
    optionId: optionId || null,
    textAnswer: textAnswer || null,
    // Auto-fail sets correctness to false by definition
    isCorrect: isAutoFail ? false : computedCorrect,
    answeredAt: new Date(),
  }).returning()

  // Build update payload so we only touch remainingTime on auto-fail
  const updateData: {
    isAnswered: boolean
    updatedAt: Date
    remainingTime?: number
  } = {
    isAnswered: true,
    updatedAt: new Date(),
  }

  if (isAutoFail) {
    // Auto-fail should lock the timer at zero
    updateData.remainingTime = 0
  }

  // Mark this question as answered so it won't show again on resume
  await db
    .update(attemptQuestionProgress)
    .set(updateData)
    .where(
      and(
        eq(attemptQuestionProgress.attemptId, attemptId),
        eq(attemptQuestionProgress.questionId, questionId),
      ),
    )

  return result[0]  // return the newly saved answer
}
