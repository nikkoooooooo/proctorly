"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { generateCertificateAction } from "@/lib/attempt/actions/generateCertificateAction"

interface DownloadCertificateButtonProps {
  attemptId: string
  isEligible: boolean
  ineligibleReason?: string | null
  allowRegenerate?: boolean
}

export default function DownloadCertificateButton({
  attemptId,
  isEligible,
  ineligibleReason,
  allowRegenerate = true,
}: DownloadCertificateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const runGeneration = async (force: boolean) => {
    if (isLoading) return
    if (!isEligible) {
      toast.error(ineligibleReason || "Certificate not available.")
      return
    }

    setIsLoading(true)
    try {
      const result = await generateCertificateAction(attemptId, { force })
      if (!result.success) {
        if (result.ineligible) {
          toast.error(result.reason || "Certificate not available.")
        } else {
          toast.error(result.error || "Failed to generate certificate.")
        }
        return
      }
      if (!result.url) {
        toast.error("Certificate link unavailable.")
        return
      }
      window.location.href = result.url
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate certificate.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEligible) {
    return (
      <p className="text-sm text-muted-foreground">
        Certificate unavailable: {ineligibleReason ?? "Eligibility not met."}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => runGeneration(false)}
        disabled={isLoading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold disabled:opacity-60"
      >
        {isLoading ? "Preparing..." : "Download Certificate"}
      </button>
      {allowRegenerate && (
        <button
          type="button"
          onClick={() => runGeneration(true)}
          disabled={isLoading}
          className="text-sm text-muted-foreground underline disabled:opacity-60"
        >
          Regenerate Certificate
        </button>
      )}
    </div>
  )
}
