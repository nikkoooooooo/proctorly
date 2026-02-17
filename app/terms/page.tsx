"use client"

import { useRouter } from "next/navigation"

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold">ProctorlyX Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: February 5, 2026</p>

        <div className="space-y-4 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using ProctorlyX, you agree to follow these terms. If you don’t agree, please do not use our service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Use of Service</h2>
            <p className="text-muted-foreground">Proctorly provides an online quiz platform for educational purposes.</p>
            <p className="text-muted-foreground">You may use it only for lawful purposes.</p>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and login details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Content and Conduct</h2>
            <p className="text-muted-foreground">You are responsible for the quizzes and content you create.</p>
            <p className="text-muted-foreground">
              Do not upload, share, or transmit anything illegal, offensive, or harmful.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. Subscriptions and Payments</h2>
            <p className="text-muted-foreground">Certain features may require payment.</p>
            <p className="text-muted-foreground">Payments are processed through secure third-party gateways.</p>
            <p className="text-muted-foreground">You are responsible for any payment method you provide.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. AI Explanations and Automation</h2>
            <p className="text-muted-foreground">
              Proctorly provides AI-generated hints or explanations for educational purposes.
            </p>
            <p className="text-muted-foreground">
              While we strive for accuracy, we do not guarantee results or outcomes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Proctorly is not responsible for any indirect, incidental, or consequential damages.
            </p>
            <p className="text-muted-foreground">Use the service at your own risk.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Account Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate accounts that violate these terms.
            </p>
            <p className="text-muted-foreground">
              Users may request deletion of their account at any time via [your email].
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">8. Modifications</h2>
            <p className="text-muted-foreground">
              Proctorly may update these terms and policies from time to time.
            </p>
            <p className="text-muted-foreground">Updated terms will be posted on the website.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Governing Law</h2>
            <p className="text-muted-foreground">These terms are governed by the laws of the Philippines.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
