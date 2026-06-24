import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-card/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Taksha</h1>
            <p className="text-lg text-muted-foreground">Empowering students to ace competitive exams</p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Story</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Taksha was founded with a simple mission: to democratize quality exam preparation for all students across India. We believe that every student, regardless of their background or financial situation, deserves access to world-class coaching and preparation materials.
              </p>
              <p>
                Our platform combines intelligent technology with expert insights to create a personalized learning experience. We&apos;ve helped thousands of students prepare for major competitive exams including UPSC, SSC, Banking exams, JEE, and NEET.
              </p>
              <p>
                Today, Taksha is trusted by over 100,000 students and continues to grow. Our team is committed to continuously improving our platform and adding new features to help students succeed.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Quality</h3>
                <p className="text-muted-foreground">We maintain the highest standards in content, technology, and user experience.</p>
              </Card>
              <Card className="p-8 border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Accessibility</h3>
                <p className="text-muted-foreground">Quality education should be affordable and accessible to everyone.</p>
              </Card>
              <Card className="p-8 border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Innovation</h3>
                <p className="text-muted-foreground">We continuously innovate to provide the best learning experience possible.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100K+</div>
                <p className="text-muted-foreground">Active Students</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <p className="text-muted-foreground">Practice Questions</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Customer Support</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
