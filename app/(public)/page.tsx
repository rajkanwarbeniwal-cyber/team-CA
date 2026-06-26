import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Zap, Users, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Master Your Exams with Smart Mock Tests
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Prepare for UPSC, SSC, Banking, JEE, NEET and state exams with our comprehensive mock test platform. Get instant analytics, detailed solutions, and leaderboards.
                </p>
                <div className="flex gap-4">
                  <Link href="/auth/sign-up">
                    <Button className="h-12 px-8 text-base">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" className="h-12 px-8 text-base">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-24 h-24 mx-auto text-primary/50 mb-4" />
                  <p className="text-muted-foreground">Learning Platform</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose Taksha?</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-background rounded-lg p-6 border border-border">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Instant Analytics</h3>
                <p className="text-sm text-muted-foreground">Get detailed performance metrics and identify weak areas in real-time.</p>
              </div>
              <div className="bg-background rounded-lg p-6 border border-border">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Community Learning</h3>
                <p className="text-sm text-muted-foreground">Discuss solutions with fellow aspirants and learn from each other.</p>
              </div>
              <div className="bg-background rounded-lg p-6 border border-border">
                <Trophy className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Leaderboards</h3>
                <p className="text-sm text-muted-foreground">Compete with others and track your progress on live leaderboards.</p>
              </div>
              <div className="bg-background rounded-lg p-6 border border-border">
                <BookOpen className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Detailed Solutions</h3>
                <p className="text-sm text-muted-foreground">Learn from comprehensive explanations for every question.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Stats */}
        <section className="py-16 bg-primary/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <p className="text-muted-foreground">Mock Tests Completed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">25K+</div>
                <p className="text-muted-foreground">Active Aspirants</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100K+</div>
                <p className="text-muted-foreground">Questions Solved</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Testimonials */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">What Students Say</h2>
            <p className="text-lg text-muted-foreground mb-12 text-center">Join thousands of successful exam aspirants</p>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "Taksha's mock tests are incredibly accurate and closely match the actual exam pattern. The detailed solutions helped me understand every concept thoroughly. I scored 95 in my SSC exam!"
                </p>
                <div>
                  <p className="font-semibold text-foreground">Priya Sharma</p>
                  <p className="text-sm text-muted-foreground">SSC CGL - 2025</p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "The analytics dashboard is a game-changer. I can track my progress, identify weak areas, and focus my preparation accordingly. The leaderboard keeps me motivated every day!"
                </p>
                <div>
                  <p className="font-semibold text-foreground">Aditya Verma</p>
                  <p className="text-sm text-muted-foreground">Banking Exam - 2025</p>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "As a UPSC aspirant, I appreciate the variety of questions and the time management features. The per-question timer mode helped me practice speed without losing accuracy."
                </p>
                <div>
                  <p className="font-semibold text-foreground">Deepak Patel</p>
                  <p className="text-sm text-muted-foreground">UPSC CSE - Preparing</p>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "The community feature is fantastic! I can discuss questions with other aspirants, get clarifications instantly, and learn different approaches to problem-solving."
                </p>
                <div>
                  <p className="font-semibold text-foreground">Anjali Singh</p>
                  <p className="text-sm text-muted-foreground">State Exam - Qualified</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Preparing?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 25K+ active students and start your journey to success.
            </p>
            <Link href="/auth/sign-up">
              <Button className="h-12 px-12 text-base">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
