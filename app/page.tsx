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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20">
          <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
            {/* <span className="font-semibold uppercase tracking-[0.25em] text-foreground bg-secondary/60 border border-border/60 px-3 py-1 rounded-full">
              Hero
            </span> */}
            <span className="h-px flex-1 bg-border/60 ml-4" />
          </div>
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
                <span className="font-semibold tracking-tight">Proctorly</span>
                <span className="ml-0.5 font-medium text-primary">X</span> keeps assessments focused, fair, and trusted.
              </h1>
              <p className="text-lg text-muted-foreground">
                Launch secure quizzes fast with clean workflows, real-time signals, and clear analytics.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/login"
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
                >
                  Create Your First Quiz
                </a>
                <a
                  href="/pricing"
                  className="border border-border text-foreground px-5 py-2.5 rounded-[var(--radius-button)] hover:bg-secondary"
                >
                  View Pricing
                </a>
              </div>
              {/* <p className="text-sm text-muted-foreground">Free users can create up to 3 quizzes.</p> */}
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                <span className="text-foreground">Live signals</span>
                <span>Window/Tab switches</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                <span className="text-foreground">Timed quizzes</span>
                <span>Per-question control</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-foreground">Attempt history</span>
                <span>Audit-ready review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.25em] text-foreground bg-background/70 border border-border/60 px-3 py-1 rounded-full">
            Why ProctorlyX
          </span>
          <span className="h-px flex-1 bg-border/60 ml-4" />
          </div>
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">Built for integrity and speed.</h2>
              <p className="text-sm text-muted-foreground">
                Create secure quizzes fast, keep proctoring non-invasive, and review attempts with clear audit trails.
              </p>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Launch fast with templates, timers, and structured flows.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Stay compliant with non-invasive integrity signals.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Act confidently with audit-ready attempt history.</span>
                </div>
              </div>
            </div>
            <div className="border border-border/60 rounded-[var(--radius-card)] p-6 bg-background/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
              <h3 className="mt-3 text-2xl font-semibold text-foreground">Founding Educator Access</h3>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-foreground">₱249</span>
                <span className="text-sm text-muted-foreground">per month (early access)</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Increases to <span className="text-foreground font-semibold">₱349</span> per month after early access
                ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.25em] text-foreground bg-secondary/60 border border-border/60 px-3 py-1 rounded-full">
            Product Showcase
          </span>
          <span className="h-px flex-1 bg-border/60 ml-4" />
          </div>
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                Everything you need to deliver secure assessments.
              </h2>
              <p className="text-sm text-muted-foreground">
                Build quizzes, monitor attempts, and review outcomes from a single, focused workspace.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                <span className="text-foreground">Quiz Builder</span>
                <span>Templates, timers, randomization</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                <span className="text-foreground">Signals Panel</span>
                <span>Tab switches, idle time</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-foreground">Attempt Review</span>
                <span>Answers, flags, and score summaries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.25em] text-foreground bg-background/70 border border-border/60 px-3 py-1 rounded-full">
            About
          </span>
          <span className="h-px flex-1 bg-border/60 ml-4" />
          </div>
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              What we truly build at{" "}
              <span className="font-semibold tracking-tight">Proctorly</span>
              <span className="ml-0.5 font-medium text-primary">X</span>.
            </h2>
              <p className="text-sm text-muted-foreground">
                We build trust in assessments. Our product keeps exams fair, transparent, and efficient for academic
                teams. Proctoring should support students and instructors without intruding on the learning experience.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Human-first integrity with clear, explainable signals.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Responsible monitoring that respects privacy.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Simple, predictable workflows for faculty teams.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-semibold uppercase tracking-[0.25em] text-foreground bg-secondary/60 border border-border/60 px-3 py-1 rounded-full">
              Get Started
            </span>
            <span className="h-px flex-1 bg-border/60 ml-4" />
          </div>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-foreground">Bring integrity to your next assessment.</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Start with early access pricing and build a proctoring workflow your faculty can trust.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-primary/90"
              >
                Start Free
              </a>
              <a
                href="/pricing"
                className="border border-border text-foreground px-5 py-2.5 rounded-[var(--radius-button)] hover:bg-secondary"
              >
                See Plans
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
