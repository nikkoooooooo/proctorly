"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type VerifyState =
  | { status: "loading" }
  | { status: "not_found"; serialNumber: string }
  | {
      status: "verified"
      serialNumber: string
      studentName: string
      quizTitle: string
      createdAt: string
    }

export default function VerifyCertificatePage() {
  const params = useParams<{ serialNumber: string }>()
  const serialNumber = decodeURIComponent(params?.serialNumber ?? "")
  const [state, setState] = useState<VerifyState>({ status: "loading" })

  useEffect(() => {
    if (!serialNumber) {
      setState({ status: "not_found", serialNumber: "" })
      return
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/cert/verify?serial=${encodeURIComponent(serialNumber)}`)
        if (!res.ok) {
          setState({ status: "not_found", serialNumber })
          return
        }
        const data = await res.json()
        if (!data?.success || !data?.certificate) {
          setState({ status: "not_found", serialNumber })
          return
        }
        setState({
          status: "verified",
          serialNumber,
          studentName: data.certificate.studentName,
          quizTitle: data.certificate.quizTitle,
          createdAt: data.certificate.createdAt,
        })
      } catch (error) {
        setState({ status: "not_found", serialNumber })
      }
    }

    load()
  }, [serialNumber])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-lg w-full card p-6 space-y-3 text-center">
        {state.status === "loading" && <p className="text-muted-foreground">Checking certificate...</p>}
        {state.status === "not_found" && (
          <>
            <h1 className="text-2xl font-semibold">Certificate Not Found</h1>
            <p className="text-muted-foreground">
              This certificate ID is invalid or not yet issued.
            </p>
            <p className="text-sm text-muted-foreground">ID: {state.serialNumber || "Unknown"}</p>
          </>
        )}
        {state.status === "verified" && (
          <>
            <h1 className="text-2xl font-semibold">Certificate Verified</h1>
            <p className="text-muted-foreground">
              This certificate is valid and issued by ProctorlyX.
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">Student:</span> {state.studentName}
              </p>
              <p>
                <span className="font-semibold">Assessment:</span> {state.quizTitle}
              </p>
              <p>
                <span className="font-semibold">Issued:</span>{" "}
                {new Date(state.createdAt).toLocaleDateString("en-PH")}
              </p>
              <p>
                <span className="font-semibold">Certificate ID:</span> {state.serialNumber}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
