import { NextResponse } from "next/server"
import { presignUpload } from "@/lib/storage/presign"

export async function GET() {
  try {
    const key = "healthcheck/presign.txt"
    const url = await presignUpload(key, "text/plain")
    return NextResponse.json({
      ok: true,
      message: "S3 presign OK",
      sampleKey: key,
      sampleUrl: url,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
