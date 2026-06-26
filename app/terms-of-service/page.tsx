import type { Metadata } from "next"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

export const metadata: Metadata = {
  title: "Terms of Service — Taksha",
  description: "Terms of Service for Taksha Smart Mock Test Platform. Read the rules and conditions for using our service.",
}

export default function TermsOfServicePage() {
  const lastUpdated = "June 26, 2025"

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">

          <section>
            <p>
              These Terms of Service ("Terms") govern your use of <strong>Taksha</strong> ("we", "our", "us"),
              accessible at <strong>taksha.education</strong>. By creating an account or using the Service, you agree
              to be bound by these Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <Section title="1. Eligibility">
            <p>
              You must be at least 13 years of age to use the Service. By using Taksha, you represent that you meet
              this requirement. If you are using the Service on behalf of an organization, you represent that you
              have the authority to bind that organization to these Terms.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <ul>
              <li>You may register using a phone number, email address, or Google account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must provide accurate and complete information during registration and keep it up to date.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>
                You must notify us immediately at{" "}
                <a href="mailto:support@taksha.education">support@taksha.education</a>{" "}
                if you suspect unauthorized use of your account.
              </li>
            </ul>
          </Section>

          <Section title="3. Permitted Use">
            <p>You may use the Service for your personal, non-commercial exam preparation. Specifically, you may:</p>
            <ul>
              <li>Attempt mock tests and view your results and analytics.</li>
              <li>Generate AI-powered personalized tests based on your subject strengths.</li>
              <li>Update your profile, exam goal, and subject strength assessments.</li>
              <li>View leaderboards and compare your performance.</li>
            </ul>
          </Section>

          <Section title="4. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>Share, publish, or distribute test questions or answer keys from Taksha without written permission.</li>
              <li>Use bots, scrapers, or automated tools to access or extract content from the Service.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Use the Service in any way that violates applicable local, state, national, or international law.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
            </ul>
            <p>
              Violation of these prohibitions may result in immediate termination of your account without notice.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content on the Service — including but not limited to test questions, answer explanations,
              graphics, logos, and AI-generated content — is owned by or licensed to Taksha and is protected by
              applicable intellectual property laws.
            </p>
            <p>
              Your use of the Service does not grant you any ownership or license to any content other than a
              limited, non-exclusive, non-transferable right to access and use the Service for your personal,
              non-commercial exam preparation.
            </p>
          </Section>

          <Section title="6. AI-Generated Content">
            <p>
              Taksha uses artificial intelligence (Anthropic Claude) to generate mock test questions personalized
              to your subject strengths and exam goal. While we strive for accuracy:
            </p>
            <ul>
              <li>AI-generated questions are for practice purposes only and may not reflect the exact pattern of official exams.</li>
              <li>We do not guarantee the factual accuracy of every AI-generated question or explanation.</li>
              <li>You should cross-verify important information with official study materials and sources.</li>
            </ul>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review it to understand our data
              practices.
            </p>
          </Section>

          <Section title="8. Service Availability">
            <p>
              We strive to keep the Service available 24/7, but we do not guarantee uninterrupted access. We may
              suspend the Service temporarily for maintenance, upgrades, or circumstances beyond our control. We
              will try to give advance notice of planned downtime where possible.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
              warranties of any kind, either express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              Taksha does not warrant that the Service will be error-free, that defects will be corrected, or that
              the Service is free of viruses or other harmful components.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Taksha shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages — including loss of data, revenue, or profits
              — arising from your use of or inability to use the Service, even if we have been advised of the
              possibility of such damages.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We reserve the right to suspend or terminate your account at any time if we determine, in our sole
              discretion, that you have violated these Terms or that your continued use poses a risk to the Service
              or other users. You may also delete your account at any time through the profile settings.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of <strong>India</strong>.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts
              located in India.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may revise these Terms from time to time. The most current version will always be available at
              this page with the updated date. Continued use of the Service after changes take effect constitutes
              your acceptance of the revised Terms. For material changes, we will notify you via email or a
              prominent notice in the Service.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mt-3 space-y-1 text-sm">
              <p><strong>Taksha</strong></p>
              <p>
                Email:{" "}
                <a href="mailto:support@taksha.education" className="text-primary hover:underline">
                  support@taksha.education
                </a>
              </p>
              <p>
                Website:{" "}
                <a href="https://taksha.education" className="text-primary hover:underline">
                  taksha.education
                </a>
              </p>
            </div>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Taksha. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-foreground font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:hover:underline">
        {children}
      </div>
    </section>
  )
}
