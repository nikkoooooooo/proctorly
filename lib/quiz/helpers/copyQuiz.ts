"use server"

import { db } from "@/lib/db"
import { quiz, question, option } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"
import { v4 as uuid } from "uuid"
import { downloadObjectFromS3, uploadImageToS3 } from "@/lib/certificate/helpers/s3Objects"
import { getCertificateLogoKey, getCertificateSignatureKey } from "@/lib/certificate/helpers/s3Keys"

const detectImageType = (bytes: Uint8Array): "png" | "jpg" => {
  if (bytes.length >= 4) {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return "png"
    }
  }
  if (bytes.length >= 3) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "jpg"
    }
  }
  return "png"
}

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
      retakeLimit: quiz.retakeLimit,
      certificateEnabled: quiz.certificateEnabled,
      certificateDescription: quiz.certificateDescription,
      certificateLogoKey: quiz.certificateLogoKey,
      certificateSignatureKey: quiz.certificateSignatureKey,
      certificateInstructorLabel: quiz.certificateInstructorLabel,
      certificateInstructorValue: quiz.certificateInstructorValue,
      certificateShowScore: quiz.certificateShowScore,
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
      correctAnswers: question.correctAnswers,
      matchStrategy: question.matchStrategy,
      caseSensitive: question.caseSensitive,
      trimWhitespace: question.trimWhitespace,
      normalize: question.normalize,
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

  let copiedLogoKey: string | null = null
  let copiedSignatureKey: string | null = null

  if (sourceQuiz.certificateLogoKey) {
    try {
      const logoBytes = await downloadObjectFromS3(sourceQuiz.certificateLogoKey)
      copiedLogoKey = getCertificateLogoKey(newQuizId)
      const logoType = detectImageType(logoBytes)
      await uploadImageToS3(copiedLogoKey, logoBytes, logoType === "png" ? "image/png" : "image/jpeg")
    } catch (error) {
      console.warn("Failed to copy certificate logo:", error)
      copiedLogoKey = null
    }
  }

  if (sourceQuiz.certificateSignatureKey) {
    try {
      const sigBytes = await downloadObjectFromS3(sourceQuiz.certificateSignatureKey)
      copiedSignatureKey = getCertificateSignatureKey(newQuizId)
      const sigType = detectImageType(sigBytes)
      await uploadImageToS3(copiedSignatureKey, sigBytes, sigType === "png" ? "image/png" : "image/jpeg")
    } catch (error) {
      console.warn("Failed to copy certificate signature:", error)
      copiedSignatureKey = null
    }
  }

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
    retakeLimit: sourceQuiz.retakeLimit ?? 0,
    certificateEnabled: sourceQuiz.certificateEnabled ?? false,
    certificateDescription: sourceQuiz.certificateDescription ?? null,
    certificateLogoKey: copiedLogoKey,
    certificateSignatureKey: copiedSignatureKey,
    certificateInstructorLabel: sourceQuiz.certificateInstructorLabel ?? null,
    certificateInstructorValue: sourceQuiz.certificateInstructorValue ?? null,
    certificateShowScore: sourceQuiz.certificateShowScore ?? true,
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
      correctAnswers: q.correctAnswers ?? null,
      matchStrategy: q.matchStrategy ?? null,
      caseSensitive: q.caseSensitive ?? null,
      trimWhitespace: q.trimWhitespace ?? null,
      normalize: q.normalize ?? null,
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
