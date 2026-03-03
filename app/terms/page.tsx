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
            aria-label="Go back"
          >
            ←
          </button>
        </div>

        <h1 className="text-3xl font-bold">ProctorlyX Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: March 3, 2026</p>

        <div className="space-y-6 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using ProctorlyX, you agree to be bound by these Terms &amp; Conditions.
            </p>
            <p className="text-muted-foreground">
              If you do not agree with any part of these terms, please contact us at{" "}
              <span className="font-medium text-foreground">tryproctorly.app@gmail.com</span> with your concerns or
              reasons before continuing to use the platform.
            </p>
            <p className="text-muted-foreground">
              Continued use of the service constitutes your acceptance of these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              ProctorlyX provides an online quiz and monitoring platform for educational purposes.
            </p>
            <p className="text-muted-foreground">
              We may update, modify, or improve features at any time. We do not guarantee uninterrupted or error-free
              operation of the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Account Responsibility</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. User Content and Conduct</h2>
            <p className="text-muted-foreground">You retain ownership of the quizzes and content you create.</p>
            <p className="text-muted-foreground">
              You are solely responsible for ensuring your content complies with applicable laws.
            </p>
            <p className="text-muted-foreground">
              You agree not to upload or distribute any content that is unlawful, harmful, offensive, or in violation of
              applicable laws.
            </p>
            <p className="text-muted-foreground">
              ProctorlyX reserves the right to remove content that violates these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Subscriptions and Payments</h2>
            <p className="text-muted-foreground">
              Certain features of ProctorlyX require a paid subscription.
            </p>
            <p className="text-muted-foreground">
              Payments are processed through secure third-party payment providers.
            </p>
            <p className="text-muted-foreground">
              All subscription fees are non-refundable unless otherwise required by law.
            </p>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time. Access will remain active until the end of your current
              billing period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, ProctorlyX shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of the service.
            </p>
            <p className="text-muted-foreground">Use of the platform is at your own risk.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Account Suspension and Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
            <p className="text-muted-foreground">
              Users may request account deletion at any time by contacting{" "}
              <span className="font-medium text-foreground">tryproctorly.app@gmail.com</span>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms &amp; Conditions from time to time. Updated terms will be posted on this page.
              Continued use of the service after updates constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms &amp; Conditions are governed by the laws of the Republic of the Philippines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}