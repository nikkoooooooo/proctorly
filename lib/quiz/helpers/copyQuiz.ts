"use server"

import { db } from "@/lib/db"
import { quiz, question, option } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"
import { v4 as uuid } from "uuid"

function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function generateUniqueJoinCode(maxAttempts = 8) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateJoinCode()
    const existing = await db
      .select({ id: quiz.id })
      .from(quiz)
      .where(eq(quiz.joinCode, code))
      .limit(1)

    if (existing.length === 0) return code
  }
  throw new Error("Failed to generate a unique join code")
}

export async function copyQuiz(quizId: string, creatorId: string) {
  const [sourceQuiz] = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      creatorId: quiz.creatorId,
      blurQuestion: quiz.blurQuestion,
      expiresAt: quiz.expiresAt,
      isPaidQuiz: quiz.isPaidQuiz,
      paidQuizFee: quiz.paidQuizFee,
      passingPercentage: quiz.passingPercentage,
      certificateEnabled: quiz.certificateEnabled,
      createdAt: quiz.createdAt,
    })
    .from(quiz)
    .where(eq(quiz.id, quizId))

  if (!sourceQuiz) {
    throw new Error("Quiz not found")
  }

  if (sourceQuiz.creatorId !== creatorId) {
    throw new Error("Not authorized to copy this quiz")
  }

  const sourceQuestions = await db
    .select({
      id: question.id,
      text: question.text,
      type: question.type,
      timerLimit: question.timerLimit,
      points: question.points,
      imageUrl: question.imageUrl,
      position: question.position,
    })
    .from(question)
    .where(eq(question.quizId, quizId))
    .orderBy(question.position)

  const sourceQuestionIds = sourceQuestions.map((q) => q.id)
  const sourceOptions = sourceQuestionIds.length
    ? await db
        .select({
          questionId: option.questionId,
          text: option.text,
          isCorrect: option.isCorrect,
        })
        .from(option)
        .where(inArray(option.questionId, sourceQuestionIds))
    : []

  const optionsByQuestion = new Map<string, typeof sourceOptions>()
  for (const opt of sourceOptions) {
    const current = optionsByQuestion.get(opt.questionId) ?? []
    current.push(opt)
    optionsByQuestion.set(opt.questionId, current)
  }

  const newQuizId = uuid()
  const newJoinCode = await generateUniqueJoinCode()
  const newTitle = `${sourceQuiz.title} (Copy)`

  await db.insert(quiz).values({
    id: newQuizId,
    title: newTitle,
    description: sourceQuiz.description ?? null,
    creatorId,
    joinCode: newJoinCode,
    blurQuestion: sourceQuiz.blurQuestion ?? false,
    expiresAt: sourceQuiz.expiresAt ?? null,
    isPaidQuiz: sourceQuiz.isPaidQuiz ?? false,
    paidQuizFee: sourceQuiz.isPaidQuiz ? sourceQuiz.paidQuizFee ?? null : null,
    passingPercentage: sourceQuiz.passingPercentage ?? null,
    certificateEnabled: sourceQuiz.certificateEnabled ?? false,
  })

  for (const q of sourceQuestions) {
    const newQuestionId = uuid()

    await db.insert(question).values({
      id: newQuestionId,
      quizId: newQuizId,
      text: q.text,
      type: q.type,
      timerLimit: q.timerLimit ?? 30,
      points: q.points ?? 1,
      imageUrl: q.imageUrl ?? null,
      position: q.position ?? null,
    })

    const opts = optionsByQuestion.get(q.id) ?? []
    for (const opt of opts) {
      await db.insert(option).values({
        id: uuid(),
        questionId: newQuestionId,
        text: opt.text,
        isCorrect: opt.isCorrect ?? false,
      })
    }
  }

  const [newQuiz] = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      joinCode: quiz.joinCode,
      description: quiz.description,
      createdAt: quiz.createdAt,
    })
    .from(quiz)
    .where(eq(quiz.id, newQuizId))

  return {
    quizId: newQuizId,
    joinCode: newJoinCode,
    quiz: newQuiz ?? {
      id: newQuizId,
      title: newTitle,
      joinCode: newJoinCode,
      description: sourceQuiz.description ?? null,
      createdAt: new Date(),
    },
  }
}
