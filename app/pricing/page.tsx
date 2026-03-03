/* This page uses router.back, so it needs to be a client component */
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { authClient } from "@/client/auth-client"
import { getUserBySessionIdAction } from "@/lib/user/actions/getUserName"
// Pricing is still in development; keep this page as a creative placeholder.

function Pricing() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [paidLabel, setPaidLabel] = useState<string | null>(null)

  useEffect(() => {
    const loadPlan = async () => {
      const sessionId = session?.session?.id
      if (!sessionId) {
        setIsPaid(false)
        setPaidLabel(null)
        return
      }

      const result = await getUserBySessionIdAction(sessionId)
      const user = result?.data?.user
      const active = user?.subscriptionStatus === "active"
      const planId = user?.planId
      if (active && planId && planId !== "free") {
        setIsPaid(true)
        setPaidLabel(planId === "early_access" ? "Early Access" : "Premium")
      } else {
        setIsPaid(false)
        setPaidLabel(null)
      }
    }

    loadPlan()
  }, [session?.session?.id])

  const startEarlyAccess = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: "early_access" }),
      })

      let data: any = null
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        data = await res.json()
      } else {
        const text = await res.text()
        data = text ? { error: text } : null
      }
      if (!res.ok) {
        alert(data?.error || "Failed to start checkout. Please try again.")
        return
      }

      const url = data?.checkoutUrl || data?.nextActionUrl
      if (!url) {
        alert("Payment link not available. Please try again.")
        return
      }

      window.location.href = url
    } catch (error) {
      console.error("Checkout failed:", error)
      alert("Could not start checkout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-background px-4">
      <div className="max-w-5xl w-full mx-auto py-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-4xl font-bold text-foreground hover:text-primary"
          >
            ←
          </button>
        </div>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">Simple, instructor-first pricing.</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Founding Educator Access gives early supporters priority input and premium capabilities.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="border border-border/60 rounded-[var(--radius-card)] bg-secondary/30 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Founding Educator Access
            </p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-foreground">₱299</span>
              <span className="text-sm text-muted-foreground">per month (early access)</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Pricing updates to <span className="text-foreground font-semibold">₱349</span> per month after early
              access ends.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={startEarlyAccess}
                disabled={isLoading}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                {isPaid
                  ? "Premium Active"
                  : isLoading
                  ? "Redirecting..."
                  : "Start Early Access"}
              </button>
              {isPaid && (
                <p className="mt-2 text-xs text-muted-foreground">
                  You already have active access. Thank you for supporting ProctorlyX.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Early access benefits</h2>
            {/* <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Priority for feature suggestions and roadmap feedback.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Premium dashboard with cleaner analytics and monitoring views.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Advanced features as they launch, included in early access.</span>
              </div>
            </div> */}

            <div className="space-y-3 text-sm text-muted-foreground">
              {[
                "Locked-in ₱299 pricing for 12 months (protected from future price increases).",
                "Priority for feature suggestions and roadmap feedback.",
                "Direct support access from the ProctorlyX team (faster response).",
                "Early access to new features before public release.",
                "Founding Instructor badge inside your dashboard.",
                "Priority onboarding help (guided setup for your first quizzes).",
                "Ability to vote/input on what we build next.",
                "Extended usage limits during early access (higher limits than future basic plan).",
                "Beta access to experimental proctoring improvements.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
