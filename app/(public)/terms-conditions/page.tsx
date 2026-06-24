'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TermsConditions() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const sections = [
    {
      id: 'agreement',
      title: 'Agreement to Terms',
      content: `These Terms and Conditions ("Terms") constitute a legal agreement between you ("User") and Taksha Educational Platform ("Company"). By accessing and using our website (www.taksha.edu) and services, you accept and agree to be bound by these Terms.

If you do not agree to abide by the above, please do not use this service. We reserve the right to update these Terms at any time without notice. Your continued use signifies your acceptance of the updated Terms.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      content: `All content on Taksha Educational Platform, including text, graphics, logos, images, videos, and software, is the property of Taksha or its content suppliers and is protected by international copyright laws.

User Restrictions:
- You may not reproduce, distribute, or transmit any content without explicit permission
- You may not modify or prepare derivative works
- You may not remove any copyright or proprietary notices
- You may not use content for commercial purposes without authorization

Educational Use:
- Content is provided for personal, non-commercial educational use only
- You may download for personal study purposes
- You must not share access credentials or distribute course materials`
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      content: `Users agree to:

1. Provide Accurate Information
   - Registration details must be truthful and complete
   - Update information if circumstances change
   - Maintain confidentiality of account credentials

2. Acceptable Use
   - Use services only for legitimate educational purposes
   - Not engage in unlawful or fraudulent activities
   - Not harass, abuse, or threaten other users
   - Not attempt to gain unauthorized access to systems
   - Not transmit viruses, malware, or harmful code

3. Compliance with Laws
   - Comply with all applicable laws and regulations
   - Respect intellectual property rights
   - Not violate any third-party rights

Violations may result in account suspension or termination without refund.`
    },
    {
      id: 'payment-refunds',
      title: 'Payment and Refund Policy',
      content: `Payment Terms:
- All prices are in Indian Rupees (INR)
- Payment is required before course access
- We accept credit cards, debit cards, and digital wallets
- Transactions are processed securely through authorized payment gateways

Refund Policy:
- Refunds available within 7 days of purchase for unused courses
- No refunds for accessed or partially completed courses
- Subscription cancellations are effective immediately; prorated refunds not available
- Refunds processed to original payment method within 10-15 business days
- Special circumstances may be considered; contact support@taksha.edu

Subscription Terms:
- Auto-renewal occurs at the end of billing period
- Cancellation available anytime before renewal
- No refunds for partial subscription periods`
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      content: `TO THE FULLEST EXTENT PERMITTED BY LAW:

1. Disclaimer of Warranties
   - Services provided "as-is" without warranties
   - We do not warrant uninterrupted, error-free service
   - No guarantee of specific exam results or outcomes
   - Content accuracy not guaranteed

2. Limitation of Damages
   - Taksha not liable for indirect, incidental, consequential damages
   - Total liability limited to amount paid in last 12 months
   - Some jurisdictions don't allow liability limitations; laws apply accordingly

3. Service Interruptions
   - Not liable for downtime, data loss, or service interruptions
   - Not liable for third-party service failures
   - Maintenance windows may result in temporary unavailability`
    },
    {
      id: 'termination',
      title: 'Account Termination',
      content: `We may terminate or suspend accounts:

1. At User's Request
   - Users may delete accounts anytime
   - Data retained per legal requirements
   - Cannot be undone; permanent deletion after 30 days

2. For Violation of Terms
   - Immediate termination for illegal activities
   - Termination for abuse or harassment
   - Termination for repeated policy violations
   - No refunds upon termination for violations

3. Inactive Accounts
   - Accounts inactive for 12+ months may be closed
   - Data deleted after notice period
   - Email notification provided beforehand`
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Jurisdiction',
      content: `These Terms are governed by the laws of India without regard to conflict of law principles.

Dispute Resolution:
1. Informal Resolution
   - Contact support@taksha.edu with disputes
   - Attempt resolution within 30 days
   
2. Formal Resolution
   - Arbitration through Indian Arbitration and Conciliation Act
   - Single arbitrator for disputes under INR 1,00,000
   - Three arbitrators for disputes above INR 1,00,000
   - Arbitration conducted in English in New Delhi

3. Legal Action
   - Exclusive jurisdiction of courts in New Delhi
   - No class action lawsuits; individual claims only`
    },
    {
      id: 'contact-support',
      title: 'Support and Contact Information',
      content: `For questions, complaints, or support:

Email: contact@taksha.edu
Phone: +91 7737775985
Website: www.taksha.edu
Address: Taksha Educational Services, India

Hours of Operation:
Monday - Friday: 9:00 AM - 6:00 PM IST
Saturday - Sunday: 10:00 AM - 4:00 PM IST

Emergency Support:
Technical issues affecting exam access: Available 24/7 via email

Response Time:
- Standard queries: 24-48 hours
- Urgent issues: 2-4 hours
- Billing inquiries: 24 hours`
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
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

        {/* Acceptance */}
        <div className="bg-primary/10 rounded-lg p-6 mt-12 border border-primary/20">
          <p className="text-sm text-foreground font-semibold">
            By using Taksha Educational Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
