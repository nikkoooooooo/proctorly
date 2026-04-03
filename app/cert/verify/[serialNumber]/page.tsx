import { db } from "@/lib/db"
import { certificate, quiz, user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

interface PageProps {
  params: { serialNumber: string }
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const rawParam = params?.serialNumber ?? ""
  let serialNumber =
    rawParam && rawParam !== "undefined" ? decodeURIComponent(rawParam) : ""

  if (!serialNumber) {
    const hdrs = headers()
    const path =
      hdrs.get("x-invoke-path") ||
      hdrs.get("x-forwarded-uri") ||
      hdrs.get("next-url") ||
      ""
    const match = path.match(/\/cert\/verify\/([^/?#]+)/i)
    if (match?.[1]) {
      serialNumber = decodeURIComponent(match[1])
    }
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
    .where(eq(certificate.serialNumber, serialNumber))
    .execute()

  if (!row || row.status !== "READY") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-lg w-full card p-6 space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Certificate Not Found</h1>
          <p className="text-muted-foreground">
            This certificate ID is invalid or not yet issued.
          </p>
          <p className="text-sm text-muted-foreground">ID: {serialNumber}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-lg w-full card p-6 space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Certificate Verified</h1>
        <p className="text-muted-foreground">
          This certificate is valid and issued by ProctorlyX.
        </p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">Student:</span> {row.studentName}
          </p>
          <p>
            <span className="font-semibold">Quiz:</span> {row.quizTitle}
          </p>
          <p>
            <span className="font-semibold">Issued:</span> {new Date(row.createdAt).toLocaleDateString("en-PH")}
          </p>
          <p>
            <span className="font-semibold">Certificate ID:</span> {row.serialNumber}
          </p>
        </div>
      </div>
    </main>
  )
}
