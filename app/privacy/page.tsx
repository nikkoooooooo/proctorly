"use client"

import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="mt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-4xl font-bold text-foreground hover:text-primary"
          >
            ←
          </button>
        </div>

        <h1 className="text-3xl font-bold">ProctorlyX Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 5, 2026</p>

        <div className="space-y-4 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold">1. Data Collection</h2>
            <p className="text-muted-foreground">
              We collect only the information necessary to provide our service, including:
            </p>
            <p className="text-muted-foreground">Name</p>
            <p className="text-muted-foreground">Email address</p>
            <p className="text-muted-foreground">Assessment answers and results</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. How We Use Data</h2>
            <p className="text-muted-foreground">
              We use this data to deliver and improve our platform, send results, and communicate updates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Data Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely and access is limited to authorized team members.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. Data Deletion</h2>
            <p className="text-muted-foreground">
              You can request deletion of your data anytime by contacting tryproctorly.app@gmail.com, and we will remove it as soon
              as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
