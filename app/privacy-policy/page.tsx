import type { Metadata } from "next"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

export const metadata: Metadata = {
  title: "Privacy Policy — Taksha",
  description: "Privacy Policy for Taksha Smart Mock Test Platform. Learn how we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
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
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose-custom space-y-8 text-[15px] leading-relaxed text-foreground/90">

          <section>
            <p>
              Welcome to <strong>Taksha</strong> ("we", "our", or "us"). This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our platform at{" "}
              <strong>taksha.app</strong> (the "Service"). Please read this policy carefully. By using the Service,
              you agree to the practices described here.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="1.1 Information you provide directly">
              <ul>
                <li><strong>Account information:</strong> Full name, email address, phone number, and password when you register.</li>
                <li><strong>Profile information:</strong> Exam goal (e.g. UPSC, SSC CGL), target state, attempt number, target year, and profile photo.</li>
                <li><strong>Subject strengths:</strong> Your self-assessed performance levels (Weak / Average / Strong) per subject.</li>
              </ul>
            </Subsection>
            <Subsection title="1.2 Information collected automatically">
              <ul>
                <li><strong>Usage data:</strong> Pages visited, tests attempted, questions answered, time spent, and score history.</li>
                <li><strong>Device data:</strong> Browser type, operating system, IP address, and device identifiers.</li>
                <li><strong>Cookies:</strong> We use session cookies for authentication and functional cookies to remember your preferences.</li>
              </ul>
            </Subsection>
            <Subsection title="1.3 Information from third parties">
              <ul>
                <li><strong>Google Sign-In:</strong> If you use Google OAuth, we receive your name, email address, and profile picture from Google as permitted by your Google account settings.</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account and authenticate you securely.</li>
              <li>Generate personalized AI-powered mock tests based on your subject strengths and exam goal.</li>
              <li>Track your performance over time and provide analytics, leaderboards, and progress reports.</li>
              <li>Send OTP codes for phone and email verification.</li>
              <li>Send transactional emails (e.g. welcome email, account notifications). We do not send marketing emails without your explicit consent.</li>
              <li>Improve, debug, and maintain the Service.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We do not sell, rent, or trade your personal information. We may share data only in these limited cases:</p>
            <ul>
              <li><strong>Service providers:</strong> We share data with Supabase (database and authentication), Resend (email delivery), Vercel (hosting), and Anthropic (AI question generation). Each provider processes data only as necessary to provide their service.</li>
              <li><strong>Legal compliance:</strong> We may disclose information if required by law, court order, or governmental authority.</li>
              <li><strong>Business transfer:</strong> In the event of a merger or acquisition, your data may be transferred to the new entity under the same privacy commitments.</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account and usage data for as long as your account is active or as needed to provide the
              Service. You may request deletion of your account and associated data at any time by contacting us at{" "}
              <a href="mailto:privacy@taksha.app" className="text-primary hover:underline">
                privacy@taksha.app
              </a>
              . We will fulfil deletion requests within 30 days, except where retention is required by law.
            </p>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>
              We use strictly necessary cookies for authentication sessions. We do not use third-party advertising
              cookies. You can control cookies through your browser settings, but disabling cookies may prevent you
              from signing in or using certain features of the Service.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed
              passwords, and Row Level Security (RLS) in our database so that users can only access their own data.
              No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              The Service is intended for users who are 13 years of age or older. We do not knowingly collect
              personal information from children under 13. If you believe a child under 13 has provided us with
              personal information, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal data.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent at any time (where processing is based on consent).</li>
              <li>Lodge a complaint with a data protection authority.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@taksha.app" className="text-primary hover:underline">
                privacy@taksha.app
              </a>
              .
            </p>
          </Section>

          <Section title="9. Third-Party Links">
            <p>
              The Service may contain links to external websites. We are not responsible for the privacy practices
              of those sites and encourage you to review their privacy policies before providing any personal
              information.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated"
              date at the top of this page. Continued use of the Service after changes constitutes your acceptance
              of the updated policy. For significant changes, we will notify you via email or a notice within the
              Service.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mt-3 space-y-1 text-sm">
              <p><strong>Taksha</strong></p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@taksha.app" className="text-primary hover:underline">
                  privacy@taksha.app
                </a>
              </p>
              <p>Website: <a href="https://taksha.app" className="text-primary hover:underline">taksha.app</a></p>
            </div>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Taksha. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-foreground font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-foreground/80">{title}</h3>
      <div className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">{children}</div>
    </div>
  )
}
