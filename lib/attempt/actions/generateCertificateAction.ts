"use server"

import { db } from "@/lib/db"
import { attempt, certificate, quiz, user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { presignRead } from "@/lib/storage/presign"
import { getCertificateKey } from "@/lib/certificate/helpers/s3Keys"
import { getCertificateEligibility } from "@/lib/certificate/helpers/eligibility"
import { buildSerialNumber } from "@/lib/certificate/helpers/serial"
import { defaultTemplateFields } from "@/lib/certificate/helpers/defaultFields"
import { uploadPdfToS3 } from "@/lib/certificate/helpers/s3Objects"
import { renderCertificatePdfBytes } from "@/lib/certificate/certificateRenderer"
import { v4 as uuid } from "uuid"
import fs from "node:fs"
import path from "node:path"

export async function generateCertificateAction(attemptId: string, options?: { force?: boolean }) {
  try {
    const force = options?.force ?? false
    const [attemptRow] = await db
      .select({
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        score: attempt.score,
        tabSwitchCount: attempt.tabSwitchCount,
      })
      .from(attempt)
      .where(eq(attempt.id, attemptId))
      .execute()

    if (!attemptRow) {
      return { success: false, error: "Attempt not found." }
    }

    const [quizRow] = await db
      .select({
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        certificateEnabled: quiz.certificateEnabled,
        creatorId: quiz.creatorId,
      })
      .from(quiz)
      .where(eq(quiz.id, attemptRow.quizId))
      .execute()

    if (!quizRow) {
      return { success: false, error: "Quiz not found." }
    }

    const [creator] = await db
      .select({ id: user.id, name: user.name, planId: user.planId })
      .from(user)
      .where(eq(user.id, quizRow.creatorId))
      .execute()

    const [student] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, attemptRow.userId))
      .execute()

    const eligibility = getCertificateEligibility({
      score: attemptRow.score ?? 0,
      passingScore: quizRow.passingScore ?? null,
      tabSwitchCount: attemptRow.tabSwitchCount ?? 0,
      certificateEnabled: quizRow.certificateEnabled ?? false,
    })

    const existing = await db
      .select({
        id: certificate.id,
        status: certificate.status,
        s3Key: certificate.s3Key,
      })
      .from(certificate)
      .where(eq(certificate.attemptId, attemptRow.id))
      .limit(1)
      .execute()

    if (existing.length > 0 && !force) {
      const cert = existing[0]
      if (cert.status === "READY" && cert.s3Key) {
        const url = await presignRead(cert.s3Key)
        return { success: true, url }
      }
      if (cert.status === "INELIGIBLE") {
        return { success: false, ineligible: true, reason: eligibility.reason ?? "Not eligible." }
      }
    }

    if (!eligibility.eligible) {
      const ineligiblePayload = {
        attemptId: attemptRow.id,
        studentId: attemptRow.userId,
        quizId: attemptRow.quizId,
        serialNumber: buildSerialNumber(new Date(), attemptRow.id),
        status: "INELIGIBLE",
      }
      if (existing.length > 0) {
        await db.update(certificate).set(ineligiblePayload).where(eq(certificate.id, existing[0].id))
      } else {
        await db.insert(certificate).values({ id: uuid(), ...ineligiblePayload })
      }
      return { success: false, ineligible: true, reason: eligibility.reason }
    }

    const defaultPath = path.join(process.cwd(), "public", "cert-templates", "default.pdf")
    const templateBytes = fs.readFileSync(defaultPath)
    const fields: Record<string, any> = defaultTemplateFields

    const issuedAt = new Date()
    const serialNumber = buildSerialNumber(issuedAt, attemptRow.id)

    const values = {
      student_name: student?.name ?? "Student",
      description: `has successfully completed the ${quizRow.title}, conducted under ProctorlyX's monitored assessment system.`,
      description_line_1: `has successfully completed the ${quizRow.title},`,
      description_line_2: "conducted under ProctorlyX's monitored assessment system.",
      serial_number: serialNumber,
      instructor_name: creator?.name ?? "Instructor",
    }

    const pdfBytes = await renderCertificatePdfBytes({
      templatePdfBytes: templateBytes,
      values,
      fields,
    })

    const key = getCertificateKey(attemptRow.userId, attemptRow.quizId, attemptRow.id)
    await uploadPdfToS3(key, pdfBytes)

    const readyPayload = {
      attemptId: attemptRow.id,
      studentId: attemptRow.userId,
      quizId: attemptRow.quizId,
      serialNumber,
      s3Key: key,
      status: "READY",
    }
    if (existing.length > 0) {
      await db.update(certificate).set(readyPayload).where(eq(certificate.id, existing[0].id))
    } else {
      await db.insert(certificate).values({ id: uuid(), ...readyPayload })
    }

    const url = await presignRead(key)
    return { success: true, url }
  } catch (error) {
    console.error("Failed to generate certificate:", error)
    return { success: false, error: "Failed to generate certificate." }
  }
}
