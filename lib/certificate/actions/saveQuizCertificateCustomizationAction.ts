"use server"

import { db } from "@/lib/db"
import { quiz } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { uploadImageToS3 } from "@/lib/certificate/helpers/s3Objects"
import { getCertificateLogoKey, getCertificateSignatureKey } from "@/lib/certificate/helpers/s3Keys"

export async function saveQuizCertificateCustomizationAction(
  quizId: string,
  formData: FormData
) {
  try {
    const description = (formData.get("certificateDescription") as string | null)?.trim() || null
    const signatureText = (formData.get("certificateSignatureText") as string | null)?.trim() || null
    const logoFile = formData.get("certificateLogo") as File | null
    const signatureFile = formData.get("certificateSignature") as File | null

    let logoKey: string | null = null
    let signatureKey: string | null = null

    if (logoFile && logoFile.size > 0) {
      const buffer = new Uint8Array(await logoFile.arrayBuffer())
      logoKey = getCertificateLogoKey(quizId)
      await uploadImageToS3(logoKey, buffer, logoFile.type || "image/png")
    }

    if (signatureFile && signatureFile.size > 0) {
      const buffer = new Uint8Array(await signatureFile.arrayBuffer())
      signatureKey = getCertificateSignatureKey(quizId)
      await uploadImageToS3(signatureKey, buffer, signatureFile.type || "image/png")
    }

    const payload: Record<string, any> = {
      certificateDescription: description,
      certificateSignatureText: signatureText,
    }

    if (logoKey) payload.certificateLogoKey = logoKey
    if (signatureKey) payload.certificateSignatureKey = signatureKey

    await db.update(quiz).set(payload).where(eq(quiz.id, quizId))

    return { success: true }
  } catch (error) {
    console.error("Failed to save certificate customization:", error)
    return { success: false, error: "Failed to save certificate customization." }
  }
}
