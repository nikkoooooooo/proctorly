import { NextResponse } from "next/server"
import { buildQuestionImageKey } from "@/lib/storage/image-keys"
import { presignUpload } from "@/lib/storage/presign"

const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(req: Request) {
  const { userId, questionId, contentType, size } = await req.json()

  if (!userId || !questionId || !contentType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  }

  if (typeof size === "number" && size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 })
  }

  const ext = contentType.split("/")[1] || "jpg"
  const key = buildQuestionImageKey(userId, questionId, ext)
  const url = await presignUpload(key, contentType)

  return NextResponse.json({ key, url })
}
