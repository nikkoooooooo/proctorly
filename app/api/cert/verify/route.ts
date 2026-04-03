import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { certificate, quiz, user } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serial = searchParams.get("serial")?.trim()
    if (!serial) {
      return NextResponse.json({ success: false, error: "Missing serial." }, { status: 400 })
    }

    const [row] = await db
      .select({
        serialNumber: certificate.serialNumber,
        status: certificate.status,
        createdAt: certificate.createdAt,
        quizTitle: quiz.title,
        studentName: user.name,
      })
      .from(certificate)
      .innerJoin(quiz, eq(quiz.id, certificate.quizId))
      .innerJoin(user, eq(user.id, certificate.studentId))
      .where(eq(certificate.serialNumber, serial))
      .execute()

    if (!row || row.status !== "READY") {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      certificate: {
        serialNumber: row.serialNumber,
        createdAt: row.createdAt,
        quizTitle: row.quizTitle,
        studentName: row.studentName,
      },
    })
  } catch (error) {
    console.error("Failed to verify certificate:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
