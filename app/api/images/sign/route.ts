import { NextResponse } from "next/server"
import { presignRead } from "@/lib/storage/presign"

export async function POST(req: Request) {
  const { key } = await req.json()

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Missing key" }, { status: 400 })
  }

  const url = await presignRead(key)
  return NextResponse.json({ url })
}
