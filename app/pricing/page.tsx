/* This page uses router.back, so it needs to be a client component */
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
// Pricing is still in development; keep this page as a creative placeholder.

function Pricing() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [paidLabel, setPaidLabel] = useState<string | null>(null)

  useEffect(() => {
    const loadPlan = async () => {
      const res = await fetch("/api/billing/status")
      const data = await res.json()
      setIsPaid(Boolean(data?.isPaid))
      setPaidLabel(data?.label ?? null)
    }

    loadPlan()
  }, [])

  const startCheckout = async (planId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
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
            Pick a plan that fits your class size and schedule. Upgrade anytime.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="border border-border/60 rounded-[var(--radius-card)] bg-secondary/20 p-6 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Free
            </p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-foreground">₱0</span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Best for trying ProctorlyX.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div>• Create up to 5 quizzes to try the platform</div>
              <div>• Secure quiz environment (copy-paste restriction & tab monitoring)</div>
              <div>• Students join using a quiz access code</div>
              <div>• Built-in quiz timer for controlled assessments</div>
              <div>• Works on phones, tablets, and laptops</div>
              <div>• Quiz attempt tracking after assessments</div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="bg-secondary text-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-secondary/80"
              >
                Start Free
              </button>
            </div>
          </div>

          <div className="border border-primary/50 rounded-[var(--radius-card)] bg-primary/10 p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Pro
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-foreground">₱189</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              For teachers running quizzes regularly.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div>• Unlimited quizzes for all your classes</div>
              <div>• Priority teacher support</div>
              <div>• Access to continuous improvements and new features</div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => startCheckout("pro")}
                disabled={isLoading || isPaid}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                {isPaid ? "Premium Active" : isLoading ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          <div className="border border-border/60 rounded-[var(--radius-card)] bg-secondary/20 p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Pro Plus
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                Best Value
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-foreground">₱449</span>
              <span className="text-sm text-muted-foreground">/ 3 months</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Best for teachers running quizzes throughout the semester.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div>• Everything in Pro</div>
              <div>• Save ₱118 compared to monthly pricing</div>
              <div>• 3 months uninterrupted access for multiple quiz periods</div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => startCheckout("pro_plus")}
                disabled={isLoading || isPaid}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                {isPaid ? "Premium Active" : isLoading ? "Redirecting..." : "Get Pro Plus"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
