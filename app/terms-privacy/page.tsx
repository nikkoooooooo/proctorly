"use client"

import { useRouter } from "next/navigation"

export default function TermsPrivacyPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
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
        {/* Page title */}
        <h1 className="text-3xl font-bold">ProctorlyX Terms & Privacy</h1>

        {/* Last updated date provided by you */}
        <p className="text-muted-foreground">Last updated: February 5, 2026</p>

        {/* Terms list */}
        <div className="space-y-4 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using ProctorlyX, you agree to follow these terms. If you don’t agree, please do not use our service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Use of Service</h2>
            <p className="text-muted-foreground">Proctorly provides an online assessment platform for educational purposes.</p>
            <p className="text-muted-foreground">You may use it only for lawful purposes.</p>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and login details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Content and Conduct</h2>
            <p className="text-muted-foreground">You are responsible for the assessments and content you create.</p>
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
            <h2 className="text-xl font-semibold">6. Data Collection & Privacy</h2>
            <p className="text-muted-foreground">
              We collect only the information necessary to provide our service, including:
            </p>
            <p className="text-muted-foreground">Name</p>
            <p className="text-muted-foreground">Email address</p>
            <p className="text-muted-foreground">Assessment answers and results</p>
            <p className="text-muted-foreground">
              We use this data to deliver and improve our platform, send results, and communicate updates.
            </p>
            <p className="text-muted-foreground">
              Your data is stored securely and access is limited to authorized team members.
            </p>
            <p className="text-muted-foreground">
              You can request deletion of your data anytime by contacting tryproctorly.app@gmail.com, and we will remove it as soon
              as possible.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Proctorly is not responsible for any indirect, incidental, or consequential damages.
            </p>
            <p className="text-muted-foreground">Use the service at your own risk.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">8. Account Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate accounts that violate these terms.
            </p>
            <p className="text-muted-foreground">
              Users may request deletion of their account at any time via tryproctorly.app@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Modifications</h2>
            <p className="text-muted-foreground">
              Proctorly may update these terms and policies from time to time.
            </p>
            <p className="text-muted-foreground">Updated terms will be posted on the website.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">10. Governing Law</h2>
            <p className="text-muted-foreground">These terms are governed by the laws of the Philippines.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
