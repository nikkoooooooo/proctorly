"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/client/auth-client";

export default function Home() {
  const router = useRouter();
  const { data } = authClient.useSession(); // ✅ client-safe
  const user = data?.user;

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            {/* Minimal hero headline */}
            <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
              ProctorlyX keeps quizzes focused and fair.
            </h1>
            {/* Short, calm value statement */}
            <p className="text-lg text-muted-foreground">
              Create timed quizzes, track attempts, and reduce distractions with non‑invasive proctoring signals.
            </p>
            {/* Free tier note requested */}
            <p className="text-sm text-muted-foreground">
              Free users can create up to 2 quizzes.
            </p>
            {/* Simple CTA row */}
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                Get Started
              </a>
              <a
                href="/pricing"
                className="border border-border text-foreground px-4 py-2 rounded-[var(--radius-button)] hover:bg-secondary"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {/* Compact feature list */}
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Core signals</p>
              </div>
              <div className="mt-3 space-y-2 text-foreground">
                <p className="text-base">Tab switch tracking</p>
                <p className="text-base">Per‑question timers</p>
                <p className="text-base">Attempt history</p>
              </div>
            </div>
            {/* Quiet reassurance line */}
            <p className="text-sm text-muted-foreground">
              Minimal setup. Clean UI. Built for instructors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
