import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Check } from "lucide-react"

export default function ShopPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Perfect for getting started",
      features: [
        "5 Mock Tests",
        "Basic Analytics",
        "Community Access",
        "Mobile App",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "₹299",
      period: "/month",
      description: "For serious aspirants",
      features: [
        "Unlimited Mock Tests",
        "Advanced Analytics",
        "Priority Support",
        "Custom Study Plans",
        "Offline Download",
        "Ad-Free Experience",
      ],
      cta: "Upgrade Now",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      description: "Ultimate preparation",
      features: [
        "Everything in Premium",
        "1-on-1 Mentoring",
        "Live Classes",
        "Personal Coach",
        "Career Guidance",
        "Guarantee Program",
      ],
      cta: "Start Pro",
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 bg-card/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground">Choose the perfect plan for your exam preparation</p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col p-8 ${
                    plan.highlighted
                      ? "border-primary bg-primary/5 shadow-lg scale-105 md:scale-100 md:shadow-xl"
                      : "border-border"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                  </div>

                  <Link href="/auth/sign-up" className="mb-8">
                    <Button
                      className="w-full h-11"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. No questions asked.",
                },
                {
                  q: "Do you offer a money-back guarantee?",
                  a: "Yes, we offer a 7-day money-back guarantee for all premium plans.",
                },
                {
                  q: "Are there any hidden charges?",
                  a: "No, we believe in transparent pricing. What you see is what you pay.",
                },
                {
                  q: "Can I upgrade or downgrade anytime?",
                  a: "Yes, you can change your plan at any time. Changes take effect immediately.",
                },
              ].map((faq, i) => (
                <div key={i} className="bg-background rounded-lg p-6 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
