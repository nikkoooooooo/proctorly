/* This page uses router.back, so it needs to be a client component */
"use client"

import React from 'react'
import { useRouter } from "next/navigation"
// Pricing is still in development; keep this page as a creative placeholder.

function Pricing() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background px-4">
      <div className="max-w-xl w-full mx-auto my-6">
        {/* Back link aligned like create-quiz page */}
        <div className="mt-5">
          {/* Use router.back so it returns to the previous page */}
          <button
            type="button"
            onClick={() => router.back()}
            className="text-4xl font-bold text-foreground hover:text-primary"
          >
            ←
          </button>
        </div>
      </div>
      <div className="max-w-xl w-full mx-auto my-10 flex items-center justify-center">
        {/* Theme-aware card while pricing is under construction */}
        <div className="bg-secondary rounded-[var(--radius-card)] border border-border p-8 shadow-lg text-center space-y-6">
          
          {/* Headline stays bold and on-brand */}
          <h1 className="text-4xl font-bold text-primary">Pricing Is Brewing</h1>

          {/* Short, creative status message */}
          {/* Keep the message human and instructor-focused */}
          <p className="text-muted-foreground text-lg">
            We are still crafting the plans. Clean, fair, and built for instructors.
          </p>

          {/* Feature promise list for the upcoming plans */}
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex gap-3">
              <span className="text-xl">🧪</span>
              {/* Humanized promise for instructors */}
              <p className="text-xl text-foreground">Start small, scale when you are ready</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">⚡</span>
              {/* Humanized pricing clarity */}
              <p className="text-xl text-foreground">Clear tiers, no surprise fees</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🤝</span>
              {/* Humanized instructor-first benefits */}
              <p className="text-xl text-foreground">Built for instructors, made easy to access</p>
            </div>
          </div>

          {/* Soft callout while we build */}
          <p className="text-sm text-muted-foreground">
            Pricing page is in active development. Check back soon.
          </p>

        </div>
      </div>
    </div>
  )
}

export default Pricing
