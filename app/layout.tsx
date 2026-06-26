import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Taksha — Smart Mock Test Platform for UPSC, SSC & Banking",
  description:
    "Prepare for UPSC, SSC, Banking and state exams with timed mock tests, instant analytics, leaderboards and detailed answer explanations. Join 100K+ aspirants achieving success.",
  icons: {
    icon: "/taksha-icon.png",
    apple: "/taksha-icon.png",
  },
  generator: "v0.app",
  openGraph: {
    title: "Taksha — Smart Mock Test Platform",
    description: "Ace your competitive exams with AI-powered mock tests and analytics",
    type: "website",
    url: "https://taksha.edu",
    images: [
      {
        url: "/taksha-badge-en.png",
        width: 1200,
        height: 630,
        alt: "Taksha Mock Test Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taksha — Smart Mock Test Platform",
    description: "Prepare for UPSC, SSC, Banking exams with timed mock tests and instant analytics",
    images: ["/taksha-badge-en.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#171b26" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
