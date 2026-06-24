'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PrivacyPolicy() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `Taksha Educational Platform ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.`
    },
    {
      id: 'information-collected',
      title: 'Information We Collect',
      content: `We collect information in several ways:

1. Information You Provide Directly
   - Account registration (name, email, phone number, educational background)
   - Payment information for course purchases
   - Profile information and preferences
   - Communication with our support team
   - Test responses and performance data

2. Automatically Collected Information
   - Device information (browser type, operating system, IP address)
   - Usage data (pages visited, time spent, clicks, interactions)
   - Cookies and similar tracking technologies
   - Location data (if permitted)

3. Third-Party Sources
   - Educational verification services
   - Payment processors
   - Social media (if you link your account)`
    },
    {
      id: 'use-information',
      title: 'How We Use Your Information',
      content: `We use collected information for:

1. Service Delivery
   - Creating and managing your account
   - Delivering exam preparation services
   - Processing payments and transactions
   - Sending transactional emails

2. Service Improvement
   - Analyzing usage patterns to improve features
   - Personalizing your learning experience
   - Conducting research and analytics
   - Developing new services

3. Communication
   - Sending promotional emails (with your consent)
   - Responding to inquiries
   - Notifying about updates and changes
   - Sending educational content

4. Security and Legal
   - Protecting against fraud and abuse
   - Enforcing our Terms and Conditions
   - Complying with legal obligations
   - Protecting user safety`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: `We implement comprehensive security measures:

- SSL/TLS encryption for all data transmissions
- Secure password hashing using industry-standard algorithms
- Regular security audits and penetration testing
- Role-based access controls for employee access
- Automatic backups with redundancy
- PCI DSS compliance for payment data

However, no method of transmission over the internet is 100% secure. While we strive to protect personal information, we cannot guarantee absolute security.`
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking Technologies',
      content: `We use cookies to:

- Remember your preferences and login information
- Track usage patterns for analytics
- Enable certain features and functionality
- Deliver personalized content

Types of cookies:
- Essential cookies: Required for basic functionality
- Analytics cookies: Help us understand how you use our services
- Functional cookies: Remember your preferences
- Marketing cookies: Track your interests for personalization

You can control cookies through your browser settings. Disabling cookies may affect site functionality.`
    },
    {
      id: 'third-party',
      title: 'Third-Party Disclosure',
      content: `We do not sell your personal information. We may share information with:

- Service providers (payment processors, hosting providers)
- Legal authorities when required by law
- Business partners for course delivery (with your consent)
- Analytics providers (anonymized data only)

All third parties are contractually obligated to maintain confidentiality and use data only for specified purposes.`
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      content: `You have the right to:

- Access your personal information
- Correct inaccurate data
- Delete your account and data (subject to legal requirements)
- Opt-out of marketing communications
- Withdraw consent for data processing
- Data portability

To exercise these rights, contact: contact@taksha.edu

For EU residents: Additional rights under GDPR including the right to restriction of processing and lodging complaints with supervisory authorities.`
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: `If you have questions about this Privacy Policy, please contact us:

Email: contact@taksha.edu
Phone: +91 7737775985
Website: www.taksha.edu
Mailing Address: Taksha Educational Services, India`
    }
  ]

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: June 2026 | Effective from June 1, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-card rounded-lg p-6 mb-8 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="text-primary hover:underline text-left"
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-card rounded-lg border border-border overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/10 transition-colors"
              >
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <ChevronRight
                  className={`w-5 h-5 text-primary transition-transform duration-300 ${
                    expandedSection === section.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSection === section.id && (
                <div className="px-6 py-4 border-t border-border bg-background/50">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="bg-secondary/10 rounded-lg p-6 mt-12 border border-secondary/20">
          <p className="text-sm text-foreground">
            This Privacy Policy is subject to change without notice. We recommend reviewing it periodically for updates.
            Continued use of our services after changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
