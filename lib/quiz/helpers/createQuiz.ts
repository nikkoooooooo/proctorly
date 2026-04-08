"use server"
// lib/helpers/quiz.ts
import { db } from "@/lib/db";               // Drizzle client
import { quiz, question, option } from "@/lib/schema"; // your tables
import { v4 as uuid } from "uuid";          // generate unique IDs

/**
 * Creates a quiz with questions and options
 * Server-only code
 */

// Generate a random 6-character alphanumeric code
function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export interface QuestionInput {
  text: string
  type: "mcq" | "true-false" | "identification"
  timerLimit?: number
  points?: number
  imageUrl?: string
  options?: { text: string; isCorrect: boolean }[]
  correctAnswers?: string[]
  matchStrategy?: "exact" | "contains" | "regex"
  caseSensitive?: boolean
  trimWhitespace?: boolean
  normalize?: boolean
}

/**
 * Create a quiz
 */
export async function createQuiz(
  creatorId: string,
  title: string,
  questionsData: QuestionInput[],
  description: string,
  blurQuestion = false,
  expiresAt?: string | null,
  retakeLimit = 0,
  isPaidQuiz = false,
  paidQuizFee?: number | null,
  passingPercentage?: number | null,
  certificateEnabled = false,
  certificateShowScore = true
) {
  const quizId = uuid()
  const joinCode = generateJoinCode()

  // Insert quiz with proctoring settings
  await db.insert(quiz).values({
    id: quizId,
    title,
    description,
    creatorId,
    joinCode,
    blurQuestion,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    retakeLimit,
    isPaidQuiz,
    paidQuizFee: isPaidQuiz ? paidQuizFee : null,
    passingPercentage: passingPercentage ?? null,
    certificateEnabled,
    certificateShowScore,
  })

  // Loop through questions
  for (const q of questionsData) {
    const questionId = uuid()
    const isIdentification = q.type === "identification"

    await db.insert(question).values({
      id: questionId,
      quizId,
      text: q.text,
      type: q.type,
      timerLimit: q.timerLimit ?? 30, // default 30 seconds
      points: q.points ?? 1,
      imageUrl: q.imageUrl ?? null,
      correctAnswers: isIdentification ? (q.correctAnswers ?? []) : null,
      matchStrategy: isIdentification ? (q.matchStrategy ?? "exact") : "exact",
      caseSensitive: isIdentification ? (q.caseSensitive ?? false) : false,
      trimWhitespace: isIdentification ? (q.trimWhitespace ?? true) : true,
      normalize: isIdentification ? (q.normalize ?? false) : false,
    })

    // Insert options
    if (q.options && q.options.length > 0) {
      for (const opt of q.options) {
        await db.insert(option).values({
          id: uuid(),
          questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })
      }
    }
  }

  // Return full quiz info
  return {
    quizId,
    joinCode,
    title,
    description,
    creatorId,
    blurQuestion,
    expiresAt: expiresAt ?? null,
    retakeLimit,
    isPaidQuiz,
    paidQuizFee: isPaidQuiz ? paidQuizFee : null,
    passingPercentage: passingPercentage ?? null,
    certificateEnabled,
    certificateShowScore,
    questions: questionsData,
  }
}
