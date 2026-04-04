"use server"

import { db } from "@/lib/db"
import { attempt, certificate, quiz, user, question } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { presignRead } from "@/lib/storage/presign"
import { getCertificateKey } from "@/lib/certificate/helpers/s3Keys"
import { getCertificateEligibility } from "@/lib/certificate/helpers/eligibility"
import { buildSerialNumber } from "@/lib/certificate/helpers/serial"
import { defaultTemplateFields } from "@/lib/certificate/helpers/defaultFields"
import { downloadObjectFromS3, uploadPdfToS3 } from "@/lib/certificate/helpers/s3Objects"
import { renderCertificatePdfBytes } from "@/lib/certificate/certificateRenderer"
import { v4 as uuid } from "uuid"
import QRCode from "qrcode"
import fs from "node:fs"
import path from "node:path"

const detectImageType = (bytes: Uint8Array): "png" | "jpg" => {
  if (bytes.length >= 4) {
    // PNG signature: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return "png"
    }
  }
  if (bytes.length >= 3) {
    // JPEG signature: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "jpg"
    }
  }
  return "png"
}

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
        passingPercentage: quiz.passingPercentage,
        certificateEnabled: quiz.certificateEnabled,
        creatorId: quiz.creatorId,
        certificateDescription: quiz.certificateDescription,
        certificateLogoKey: quiz.certificateLogoKey,
        certificateSignatureKey: quiz.certificateSignatureKey,
        certificateSignatureText: quiz.certificateSignatureText,
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

    const buildFilename = (value: string) =>
      value
        .replace(/[^a-z0-9-_ ]/gi, "")
        .trim()
        .replace(/\s+/g, "-")

    const studentLabel = buildFilename(student?.name ?? "Student")
    const quizLabel = buildFilename(quizRow.title ?? "Quiz")
    const downloadName = `ProctorlyX-Certificate-${studentLabel}-${quizLabel}.pdf`

    const questions = await db
      .select({ points: question.points })
      .from(question)
      .where(eq(question.quizId, attemptRow.quizId))
      .execute()

    const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 1), 0)

    const eligibility = getCertificateEligibility({
      score: attemptRow.score ?? 0,
      totalPoints,
      passingPercentage: quizRow.passingPercentage ?? null,
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
        const url = await presignRead(cert.s3Key, downloadName)
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

    const description =
      quizRow.certificateDescription?.trim() ||
      `has successfully completed the ${quizRow.title}, conducted under ProctorlyX's monitored assessment system.`

    const signatureText = quizRow.certificateSignatureKey
      ? ""
      : (quizRow.certificateSignatureText ?? "").trim()

    const values = {
      student_name: student?.name ?? "Student",
      description,
      serial_number: serialNumber,
      instructor_name: creator?.name ?? "Instructor",
      signature_text: signatureText,
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proctorlyx.com"
    const verifyUrl = `${baseUrl}/cert/verify/${serialNumber}`
    const qrPng = await QRCode.toBuffer(verifyUrl, { width: 220, margin: 1 })

    const images: Record<string, { bytes: Uint8Array; type: "png" | "jpg" }> = {
      qr_code: { bytes: qrPng, type: "png" },
    }

    if (quizRow.certificateLogoKey) {
      const logoBytes = await downloadObjectFromS3(quizRow.certificateLogoKey)
      images.logo_image = { bytes: logoBytes, type: detectImageType(logoBytes) }
    }

    if (quizRow.certificateSignatureKey) {
      const sigBytes = await downloadObjectFromS3(quizRow.certificateSignatureKey)
      images.signature_image = { bytes: sigBytes, type: detectImageType(sigBytes) }
    }

    const pdfBytes = await renderCertificatePdfBytes({
      templatePdfBytes: templateBytes,
      values,
      fields,
      images,
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

    const url = await presignRead(key, downloadName)
    return { success: true, url }
  } catch (error) {
    console.error("Failed to generate certificate:", error)
    return { success: false, error: "Failed to generate certificate." }
  }
}
