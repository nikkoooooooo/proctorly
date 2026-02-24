/* This page uses router.back, so it needs to be a client component */
"use client"

import React from 'react'
import { useRouter } from "next/navigation"
// Pricing is still in development; keep this page as a creative placeholder.

function Pricing() {
  const router = useRouter()
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
              <span className="text-4xl font-semibold text-foreground">₱249</span>
              <span className="text-sm text-muted-foreground">per month (early access)</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Pricing updates to <span className="text-foreground font-semibold">₱349</span> per month after early
              access ends.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                Start Early Access
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Early access benefits</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
